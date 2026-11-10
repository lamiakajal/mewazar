import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { calculatePricing, findValidVoucher } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import User from "@/models/User";
import CoinTransaction from "@/models/CoinTransaction";
import { getAllProducts, catalogIsInDatabase } from "@/lib/catalog";
import ProductModel from "@/models/Product";
import { sendOrderPlacedEmails } from "@/lib/email";
import { BRAND } from "@/data/brand";
import { getGateway } from "@/lib/payments/registry";
import Order from "@/models/Order";

// Payment methods the Order model accepts
const ORDER_PAYMENT_METHODS = [
  "cod",
  "jazzcash",
  "easypaisa",
  "sadapay",
  "meezan",
] as const;
type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];
const isOrderPaymentMethod = (id: string): id is OrderPaymentMethod =>
  (ORDER_PAYMENT_METHODS as readonly string[]).includes(id);

const MAX_LINE_QUANTITY = 20;
const MAX_LINES = 40;

interface IncomingItem {
  productId?: unknown;
  weight?: unknown;
  quantity?: unknown;
}

const clean = (value: unknown, max = 200): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Short, human-friendly order number, e.g. MZ-LK3F9A-7QX */
function generateOrderNumber(): string {
  const time = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `MZ-${time}-${rand}`;
}

// GET: the signed-in customer's order history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please sign in to view your orders" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const userId = (session.user as { id?: string }).id;
    const email = session.user.email?.toLowerCase();

    const filters: Record<string, unknown>[] = [];
    if (userId && mongoose.isValidObjectId(userId)) filters.push({ userId });
    if (email) filters.push({ "shippingAddress.email": email });

    if (filters.length === 0) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const orders = await Order.find({ $or: filters })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const { couriers } = await getSettings();
    return NextResponse.json({ orders, couriers }, { status: 200 });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// POST: place an order (guests and signed-in customers).
// The client only sends product ids, pack sizes and quantities. Prices,
// discounts and delivery are recalculated here so they cannot be tampered with.
export async function POST(req: Request) {
  if (!(await rateLimit(`order:${clientIp(req)}`, 10, 10 * 60 * 1000)))
    return tooManyRequests();

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const rawItems: IncomingItem[] = Array.isArray(body.items)
      ? body.items
      : [];
    if (rawItems.length === 0 || rawItems.length > MAX_LINES) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 },
      );
    }

    // 1. Rebuild every line from the trusted catalog (database, or starter data)
    const catalog = await getAllProducts();
    const items = [];
    for (const raw of rawItems) {
      const product = catalog.find((p) => p.id === raw.productId);
      const variant = product?.variants.find((v) => v.weight === raw.weight);
      const quantity = Math.floor(Number(raw.quantity));

      if (!product || !variant || !Number.isFinite(quantity) || quantity < 1) {
        return NextResponse.json(
          {
            error:
              "A product in your cart is no longer available. Please refresh your cart.",
          },
          { status: 400 },
        );
      }

      if (quantity > MAX_LINE_QUANTITY || quantity > variant.stock) {
        return NextResponse.json(
          {
            error: `Only ${Math.min(variant.stock, MAX_LINE_QUANTITY)} of ${product.name} (${variant.weight}) can be ordered right now.`,
          },
          { status: 400 },
        );
      }

      items.push({
        productId: product.id,
        name: product.name,
        image: product.images[0],
        weight: variant.weight,
        price: variant.price,
        quantity,
      });
    }

    // 2. Validate customer details
    const address = body.shippingAddress ?? {};
    const shippingAddress = {
      fullName: clean(address.fullName, 100),
      phone: clean(address.phone, 20),
      email:
        clean(address.email, 120).toLowerCase() ||
        session?.user?.email?.toLowerCase() ||
        "",
      address: clean(address.address, 300),
      city: clean(address.city, 60),
      postalCode: clean(address.postalCode, 12),
    };

    if (
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city
    ) {
      return NextResponse.json(
        { error: "Please fill in your name, address and city" },
        { status: 400 },
      );
    }
    if (!/^[+\d][\d\s-]{8,18}$/.test(shippingAddress.phone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 },
      );
    }
    // The order model requires an email; fall back to a store-owned placeholder for guests.
    if (!shippingAddress.email) {
      shippingAddress.email = "guest@mewazar.pk";
    } else if (!/^\S+@\S+\.\S+$/.test(shippingAddress.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // 3. Validate payment method
    const paymentMethod = clean(body.paymentMethod, 20);
    const settings = await getSettings();
    const method = settings.payments.find(
      (p) => p.id === paymentMethod && p.isActive,
    );
    if (!method || !isOrderPaymentMethod(method.id)) {
      return NextResponse.json(
        { error: "Unsupported payment method" },
        { status: 400 },
      );
    }
    const methodId: OrderPaymentMethod = method.id;

    // Online payment provider for this method (only counts when it is installed and configured)
    const gateway = getGateway(method.gateway);
    const gatewayReady = !!gateway && gateway.isConfigured();

    // Without an online provider, wallet and bank orders must carry the transaction ID the
    // customer got after sending the money, so the shop can match it with its own account.
    if (
      methodId !== "cod" &&
      !gatewayReady &&
      clean(body.transactionId, 80).length < 6
    ) {
      return NextResponse.json(
        {
          error:
            "Please send the payment first, then enter the transaction ID you received.",
        },
        { status: 400 },
      );
    }

    // 4. Server-side totals
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Shop switches controlled from /admin/settings
    if (!settings.orders.acceptingOrders) {
      return NextResponse.json(
        { error: settings.orders.closedMessage },
        { status: 503 },
      );
    }
    const goodsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (goodsTotal < settings.orders.minOrderAmount) {
      return NextResponse.json(
        {
          error: `The minimum order amount is Rs. ${settings.orders.minOrderAmount.toLocaleString()}.`,
        },
        { status: 400 },
      );
    }

    const voucherCode = clean(body.voucherCode, 30);
    const voucher = findValidVoucher(settings.vouchers, voucherCode, subtotal);
    if (voucherCode && !voucher) {
      return NextResponse.json(
        {
          error:
            "This coupon is no longer valid. Please remove it and try again.",
        },
        { status: 400 },
      );
    }
    await connectToDatabase();

    // Reward coins can only be spent by signed-in customers, up to their real balance
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const validUserId =
      userId && mongoose.isValidObjectId(userId) ? userId : undefined;
    let coinsRequested = 0;
    if (
      settings.rewards.enabled &&
      validUserId &&
      Number(body.coinsToUse) > 0
    ) {
      const account = await User.findById(validUserId)
        .select("coinBalance")
        .lean<{ coinBalance?: number }>();
      coinsRequested = Math.min(
        Math.floor(Number(body.coinsToUse)),
        account?.coinBalance ?? 0,
      );
    }

    const pricing = calculatePricing({
      subtotal,
      voucher,
      paymentDiscountPercent: method.discountPercent || 0,
      shipping: {
        fee: settings.shipping.fee,
        freeThreshold: settings.shipping.freeThreshold,
      },
      coins:
        coinsRequested > 0
          ? {
              requested: coinsRequested,
              value: settings.rewards.coinValue,
              maxPercent: settings.rewards.maxRedeemPercent,
            }
          : undefined,
    });

    // Reserve stock atomically. Each update only succeeds if enough stock is left,
    // so two customers cannot buy the last unit at the same time.
    const trackStock = await catalogIsInDatabase();
    const reserved: { productId: string; weight: string; quantity: number }[] =
      [];
    const releaseStock = async () => {
      for (const r of reserved) {
        await ProductModel.updateOne(
          { id: r.productId, "variants.weight": r.weight },
          { $inc: { "variants.$.stock": r.quantity } },
        );
      }
    };

    if (trackStock) {
      for (const line of items) {
        const result = await ProductModel.updateOne(
          {
            id: line.productId,
            variants: {
              $elemMatch: {
                weight: line.weight,
                stock: { $gte: line.quantity },
              },
            },
          },
          { $inc: { "variants.$.stock": -line.quantity } },
        );
        if (result.modifiedCount !== 1) {
          await releaseStock();
          return NextResponse.json(
            {
              error: `Sorry, ${line.name} (${line.weight}) just sold out. Please update your cart.`,
            },
            { status: 409 },
          );
        }
        reserved.push({
          productId: line.productId,
          weight: line.weight,
          quantity: line.quantity,
        });
      }
    }

    // Take the coins from the balance atomically (only succeeds if the balance is still enough)
    let coinsDeducted = false;
    const refundCoins = async () => {
      if (coinsDeducted && validUserId) {
        await User.updateOne(
          { _id: validUserId },
          { $inc: { coinBalance: pricing.coinsUsed } },
        );
      }
    };
    if (pricing.coinsUsed > 0 && validUserId) {
      const result = await User.updateOne(
        { _id: validUserId, coinBalance: { $gte: pricing.coinsUsed } },
        { $inc: { coinBalance: -pricing.coinsUsed } },
      );
      if (result.modifiedCount !== 1) {
        await releaseStock();
        return NextResponse.json(
          {
            error:
              "Your coin balance changed. Please review your order and try again.",
          },
          { status: 409 },
        );
      }
      coinsDeducted = true;
    }

    // 5. Save, retrying on the (very unlikely) order number collision
    let saved: { orderNumber: string } | null = null;
    for (let attempt = 0; attempt < 3 && !saved; attempt++) {
      try {
        saved = await Order.create({
          orderNumber: generateOrderNumber(),
          userId: validUserId,
          isGuest: !session?.user,
          items,
          shippingAddress,
          paymentMethod: methodId,
          transactionId: clean(body.transactionId, 80),
          voucherCode: pricing.appliedVoucherCode ?? "",
          subtotal: pricing.subtotal,
          discount: pricing.totalDiscount,
          coinsUsed: pricing.coinsUsed,
          coinDiscount: pricing.coinDiscount,
          deliveryFee: pricing.shippingFee,
          totalAmount: pricing.total,
          orderStatus: "placed",
        });
      } catch (error) {
        const duplicate = (error as { code?: number }).code === 11000;
        if (!duplicate || attempt === 2) {
          await releaseStock();
          await refundCoins();
          throw error;
        }
      }
    }

    if (saved && pricing.coinsUsed > 0 && validUserId) {
      await CoinTransaction.create({
        userId: validUserId,
        type: "redeem",
        coins: -pricing.coinsUsed,
        orderNumber: saved.orderNumber,
        note: "Used at checkout",
      });
    }

    // Confirmation to the customer and an alert to the shop owner (never throws)
    if (saved) {
      await sendOrderPlacedEmails({
        orderNumber: saved.orderNumber,
        items,
        shippingAddress,
        paymentMethod: methodId,
        transactionId: clean(body.transactionId, 80),
        subtotal: pricing.subtotal,
        discount: pricing.totalDiscount,
        deliveryFee: pricing.shippingFee,
        totalAmount: pricing.total,
      });
    }

    // Online payment: ask the provider for its payment page and send the customer there
    let paymentUrl: string | undefined;
    let paymentError: string | undefined;
    if (saved && gateway && gatewayReady) {
      try {
        const started = await gateway.createPayment({
          orderNumber: saved.orderNumber,
          amount: pricing.total,
          currency: "PKR",
          customerName: shippingAddress.fullName,
          customerEmail: shippingAddress.email,
          customerPhone: shippingAddress.phone,
          returnUrl: `${BRAND.siteUrl}/api/payments/callback/${gateway.id}`,
          webhookUrl: `${BRAND.siteUrl}/api/payments/webhook/${gateway.id}`,
        });
        paymentUrl = started.redirectUrl;
        await Order.updateOne(
          { orderNumber: saved.orderNumber },
          { paymentGateway: gateway.id, gatewayRef: started.providerRef ?? "" },
        );
      } catch (error) {
        console.error("Could not start online payment:", error);
        paymentError =
          "Your order is saved, but online payment is not available right now. Please contact us to pay another way.";
      }
    }

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderNumber: saved?.orderNumber,
        totals: pricing,
        paymentUrl,
        paymentError,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
