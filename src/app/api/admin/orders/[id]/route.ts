import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { catalogIsInDatabase } from "@/lib/catalog";
import { sendStatusEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { trackingLink } from "@/lib/tracking";
import { creditCoinsForDelivery, reverseCoinsForCancellation } from "@/lib/rewards";
import Order from "@/models/Order";
import ProductModel from "@/models/Product";

type Ctx = { params: Promise<{ id: string }> };

const ORDER_STATUSES = ["placed", "processing", "dispatched", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "verified", "failed", "refunded"];

/** Admin updates: order stage, payment verification, courier details. */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await getStaffWith("orders"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();

  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const previousStatus = order.orderStatus;

  if (body.orderStatus !== undefined) {
    if (!ORDER_STATUSES.includes(body.orderStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }
    if (previousStatus === "cancelled" && body.orderStatus !== "cancelled") {
      return NextResponse.json(
        { error: "A cancelled order cannot be reopened. Ask the customer to place a new order." },
        { status: 400 },
      );
    }
    order.orderStatus = body.orderStatus;
  }

  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    order.paymentStatus = body.paymentStatus;
  }

  if (typeof body.trackingId === "string") order.trackingId = body.trackingId.trim().slice(0, 80);
  if (typeof body.courier === "string") order.courier = body.courier.trim().slice(0, 60);
  if (typeof body.adminNote === "string") order.adminNote = body.adminNote.trim().slice(0, 500);

  // Cancelling returns the reserved stock to the shelf (only once)
  if (order.orderStatus === "cancelled" && !order.stockRestored && (await catalogIsInDatabase())) {
    for (const item of order.items) {
      await ProductModel.updateOne(
        { id: item.productId, "variants.weight": item.weight },
        { $inc: { "variants.$.stock": item.quantity } },
      );
    }
    order.stockRestored = true;
  }

  // Reward coins: earned when delivered, returned/taken back when cancelled
  if (order.orderStatus !== previousStatus) {
    if (order.orderStatus === "delivered") {
      await creditCoinsForDelivery(order, (await getSettings()).rewards);
    } else if (order.orderStatus === "cancelled") {
      await reverseCoinsForCancellation(order);
    }
  }

  await order.save();

  if (order.orderStatus !== previousStatus && body.notify !== false) {
    await sendStatusEmail({
      to: order.shippingAddress.email,
      customerName: order.shippingAddress.fullName,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      courier: order.courier,
      trackingId: order.trackingId,
      trackingUrl: trackingLink((await getSettings()).couriers, order.courier, order.trackingId),
    });
  }

  await logAction("order.update", `${order.orderNumber}: status ${previousStatus} to ${order.orderStatus}, payment ${order.paymentStatus}`);
  return NextResponse.json({ order });
}
