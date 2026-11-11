"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import Confetti from "@/components/ui/Confetti";
import type { RewardSettings } from "@/lib/settings-types";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Building2,
  Tag,
  Coins,
  Check,
  X,
  Smartphone,
  Sparkles,
  QrCode,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { PaymentOption, Voucher } from "@/data/storeConfig";
import { calculatePricing } from "@/lib/pricing";

interface CheckoutViewProps {
  payments: PaymentOption[];
  shipping: { fee: number; freeThreshold: number };
  rewards: RewardSettings;
  orders: { acceptingOrders: boolean; closedMessage: string; minOrderAmount: number };
}

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Multan",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Gilgit",
  "Other City",
];

const emptySubscribe = () => () => {};

export default function CheckoutView({ payments, shipping, rewards, orders }: CheckoutViewProps) {
  const { cart, subtotal, clearCart } = useCart();

  // Avoid hydration mismatch by syncing client mount state
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Payment methods and delivery fees are managed by the owner in /admin/settings
  const storeConfig = { paymentMethods: payments, coinsEnabled: rewards.enabled };

  // Reward coins belong to signed-in customers; read the real balance from the server
  const { status: authStatus } = useSession();
  const [coinBalance, setCoinBalance] = useState(0);
  const [applyCoins, setApplyCoins] = useState(false);
  useEffect(() => {
    if (!rewards.enabled || authStatus !== "authenticated") return;
    let cancelled = false;
    fetch("/api/rewards")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setCoinBalance(data.balance ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [rewards.enabled, authStatus]);
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");

  const [selectedPaymentId, setSelectedPaymentId] =
    useState<PaymentOption["id"]>("cod");

  // Payment transaction reference state
  const [transactionRef, setTransactionRef] = useState("");
  const [copiedText, setCopiedText] = useState("");

  const activePaymentMethod =
    storeConfig.paymentMethods.find((p) => p.id === selectedPaymentId) ||
    storeConfig.paymentMethods[0];

  // Pricing comes from the same helper the order API uses, so the amount
  // shown here is exactly what the server will charge.
  const pricing = calculatePricing({
    subtotal,
    voucher: appliedVoucher,
    paymentDiscountPercent: activePaymentMethod.discountPercent || 0,
    shipping,
    coins:
      applyCoins && coinBalance > 0
        ? { requested: coinBalance, value: rewards.coinValue, maxPercent: rewards.maxRedeemPercent }
        : undefined,
  });
  const voucherDiscountAmount = pricing.voucherDiscount;
  const paymentDiscountPercent = activePaymentMethod.discountPercent || 0;
  const paymentDiscountAmount = pricing.paymentDiscount;
  // The server re-checks the balance and applies the same rules
  const coinDiscountAmount = pricing.coinDiscount;
  const ordersOpen = orders.acceptingOrders && subtotal >= orders.minOrderAmount;
  const totalDiscounts = pricing.totalDiscount;
  const shippingFee = pricing.shippingFee;
  const grandTotal = pricing.total;

  // Customer shipping information state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Karachi",
    address: "",
    postalCode: "",
    orderNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [orderError, setOrderError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Launch mobile app deep link or web fallback portal
  const handleOneClickPay = () => {
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && activePaymentMethod.appScheme) {
      window.location.href = activePaymentMethod.appScheme;
      setTimeout(() => {
        if (activePaymentMethod.webFallbackUrl) {
          window.open(activePaymentMethod.webFallbackUrl, "_blank");
        }
      }, 2000);
    } else if (activePaymentMethod.webFallbackUrl) {
      window.open(activePaymentMethod.webFallbackUrl, "_blank");
    } else {
      handleCopy(activePaymentMethod.accountDetails.accountNumber);
    }
  };

  // Coupons are checked on the server, so the list of codes is never sent to the browser
  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");
    const code = voucherInput.trim();
    if (!code) return;

    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVoucherError(data.error || "Invalid or expired coupon code.");
        return;
      }
      setAppliedVoucher(data.voucher as Voucher);
      setVoucherInput("");
    } catch {
      setVoucherError("Could not check the coupon. Please try again.");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
  };

  // Submit order handler syncing with MongoDB API route
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError("");

    const orderPayload = {
      // Only identifiers and quantities are sent; prices are recalculated on the server.
      items: cart.map((item) => ({
        productId: item.productId,
        weight: item.weight,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      paymentMethod: selectedPaymentId,
      transactionId: transactionRef || "",
      voucherCode: appliedVoucher?.code ?? null,
      coinsToUse: applyCoins ? pricing.coinsUsed : 0,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to save your order. Please try again.");
      }

      const orderId: string = data.orderNumber;
      clearCart();

      // Online payment: the order is saved, now the provider's payment page takes over
      if (data.paymentUrl) {
        window.location.assign(data.paymentUrl);
        return;
      }

      setGeneratedOrderId(orderId);
      setOrderPlaced(true);
      if (data.paymentError) setOrderError(data.paymentError);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOrderError(err.message);
      } else {
        setOrderError("An unexpected error occurred while placing your order.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-canvas min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Order Confirmed Screen
  if (orderPlaced) {
    return (
      <div className="bg-canvas min-h-[80vh] flex items-center justify-center py-16 px-4">
        <Confetti />
        <div className="max-w-lg w-full bg-surface rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-leaf-100 text-heading rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
              Shukriya for your order!
            </h1>
            <p className="text-xs text-stone-500">
              Your order has been recorded securely in our database. Our
              dispatch center will verify and send tracking details to your
              WhatsApp.
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 text-left space-y-2 text-xs border border-stone-100">
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Order Number:</span>
              <strong className="text-stone-900">{generatedOrderId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Customer:</span>
              <span className="text-stone-800 font-semibold">
                {formData.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">WhatsApp:</span>
              <span className="text-stone-800 font-semibold">
                {formData.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Destination:</span>
              <span className="text-stone-800 font-semibold">
                {formData.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-medium">Payment Mode:</span>
              <span className="text-stone-800 font-bold">
                {activePaymentMethod.name}
              </span>
            </div>
            {transactionRef && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">
                  Txn / Ref ID:
                </span>
                <span className="text-leaf-700 font-bold">
                  {transactionRef}
                </span>
              </div>
            )}
            {totalDiscounts > 0 && (
              <div className="flex justify-between text-leaf-700 font-bold">
                <span>Total Savings:</span>
                <span>Rs. {totalDiscounts.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900 text-sm">
              <span>Final Amount:</span>
              <span className="text-heading">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/orders"
              className="w-full py-3.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition"
            >
              View in My Orders
            </Link>
            <Link
              href="/shop"
              className="text-xs font-bold text-stone-500 hover:text-stone-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (cart.length === 0) {
    return (
      <div className="bg-canvas min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-surface rounded-3xl border border-stone-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-gold-50 text-gold-700 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-stone-800">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-stone-500">
            Please add organic honey or fresh dry fruits to your cart before
            proceeding.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Form: Address & Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
              <div>
                <h1 className="text-2xl font-display font-bold text-stone-900">
                  Shipping & Delivery Address
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Deliveries handled with care across all major cities of
                  Pakistan.
                </p>
              </div>

              {orderError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                  {orderError}
                </div>
              )}

              <form
                id="checkout-form"
                onSubmit={handleSubmitOrder}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-bold text-stone-700 mb-1.5"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Muhammad Usman"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-stone-700 mb-1.5"
                    >
                      Phone / WhatsApp Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0300 1234567"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-stone-700 mb-1.5"
                    >
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@domain.com"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-xs font-bold text-stone-700 mb-1.5"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                    >
                      {PAKISTAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-xs font-bold text-stone-700 mb-1.5"
                    >
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 74200"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-xs font-bold text-stone-700 mb-1.5"
                  >
                    Complete Street Address / House / Flat No.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House number, Street, Sector / Area name..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                  />
                </div>

                <div>
                  <label
                    htmlFor="orderNotes"
                    className="block text-xs font-bold text-stone-700 mb-1.5"
                  >
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    id="orderNotes"
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    placeholder="e.g. Call before delivery, deliver in morning..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
                  />
                </div>
              </form>
            </div>

            {/* Popular Pakistani Payment Methods */}
            <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-display font-bold text-stone-900">
                  Select Payment Method
                </h2>
                <p className="text-xs text-stone-500">
                  {Math.max(0, ...payments.filter((p) => p.isActive).map((p) => p.discountPercent)) > 0
                    ? `Choose digital payment to get up to ${Math.max(...payments.filter((p) => p.isActive).map((p) => p.discountPercent))}% instant discount!`
                    : "Choose how you would like to pay."}
                </p>
              </div>

              <div className="space-y-3">
                {storeConfig.paymentMethods
                  .filter((p) => p.isActive)
                  .map((method) => {
                    const isSelected = selectedPaymentId === method.id;
                    return (
                      <div
                        key={method.id}
                        className={`border-2 rounded-2xl p-4 transition ${
                          isSelected
                            ? "border-primary bg-leaf-50/30 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-surface"
                        }`}
                      >
                        <label className="flex items-start gap-3.5 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethodRadio"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => setSelectedPaymentId(method.id)}
                            className="mt-1 accent-primary"
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {method.id === "cod" && (
                                  <Truck className="w-4 h-4 text-heading" />
                                )}
                                {method.id === "jazzcash" && (
                                  <Smartphone className="w-4 h-4 text-orange-600" />
                                )}
                                {method.id === "easypaisa" && (
                                  <Smartphone className="w-4 h-4 text-leaf-600" />
                                )}
                                {method.id === "sadapay" && (
                                  <CreditCard className="w-4 h-4 text-teal-600" />
                                )}
                                {method.id === "meezan" && (
                                  <Building2 className="w-4 h-4 text-heading" />
                                )}
                                <span className="font-bold text-xs text-stone-800">
                                  {method.name}
                                </span>
                              </div>

                              {method.discountPercent > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-leaf-800 bg-leaf-100 px-2 py-0.5 rounded-full animate-pulse">
                                  <Sparkles className="w-3 h-3" />
                                  {method.discountPercent}% OFF
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-stone-500 mt-1">
                              {method.subtitle}
                            </p>
                          </div>
                        </label>

                        {/* 1-Click Pay & QR Box for selected digital method */}
                        {isSelected && method.id !== "cod" && (
                          <div className="mt-4 pt-4 space-y-3 bg-surface p-4 rounded-xl border border-stone-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="space-y-1 text-xs text-stone-700 w-full sm:w-auto">
                                <p className="font-bold text-heading">
                                  Account Information:
                                </p>
                                <p>
                                  Title:{" "}
                                  <strong>{method.accountDetails.title}</strong>
                                </p>
                                <div className="flex items-center gap-2">
                                  <span>
                                    Number / ID:{" "}
                                    <strong>
                                      {method.accountDetails.accountNumber}
                                    </strong>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(
                                        method.accountDetails.accountNumber,
                                      )
                                    }
                                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                                    title="Copy Number"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {copiedText ===
                                    method.accountDetails.accountNumber && (
                                    <span className="text-[10px] text-leaf-600 font-bold">
                                      Copied!
                                    </span>
                                  )}
                                </div>
                                {method.accountDetails.raastId && (
                                  <p>
                                    Raast ID:{" "}
                                    <strong>
                                      {method.accountDetails.raastId}
                                    </strong>
                                  </p>
                                )}
                                {method.accountDetails.iban && (
                                  <p className="text-[11px]">
                                    IBAN:{" "}
                                    <strong>
                                      {method.accountDetails.iban}
                                    </strong>
                                  </p>
                                )}
                              </div>

                              {/* Instant Scan QR Code */}
                              {method.qrCodeUrl && (
                                <div className="flex flex-col items-center bg-stone-50 p-2 rounded-xl border border-stone-200 shrink-0">
                                  <div className="relative w-24 h-24">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={method.qrCodeUrl}
                                      alt={`${method.name} QR Code`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <span className="text-[9px] font-bold text-stone-500 mt-1 flex items-center gap-1">
                                    <QrCode className="w-3 h-3 text-heading" />{" "}
                                    Scan to Pay
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* 1-Click Mobile App / Web Launcher Button */}
                            <button
                              type="button"
                              onClick={handleOneClickPay}
                              className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>
                                Launch {method.name.split(" ")[0]} Pay (App /
                                Web)
                              </span>
                            </button>

                            {/* Transaction ID / Ref input */}
                            {method.gateway ? (
                              <p className="rounded-xl bg-gold-50 px-3 py-2 text-[11px] font-semibold text-gold-900">
                                After you press Confirm Order you will be taken to the secure {method.name} payment page.
                              </p>
                            ) : (
                            <div className="pt-2">
                              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                                1. Send the amount to the account above. 2. Enter the Transaction ID you received (required):
                              </label>
                              <input
                                type="text"
                                required
                                minLength={6}
                                placeholder="e.g. TID-9876543210 or Bank Reference"
                                value={transactionRef}
                                onChange={(e) =>
                                  setTransactionRef(e.target.value)
                                }
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right: Order Summary + Discounts, Vouchers & Coins */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 sticky top-28">
              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <h2 className="text-lg font-display font-bold text-stone-900">
                  Order Summary
                </h2>
                <span className="text-xs font-semibold text-stone-500">
                  {cart.length} item{cart.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {item.weight} &times; {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-heading">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Voucher Code Box */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gold-600" />
                    <span>Apply Voucher Code</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    Try: MEWA10 or WELCOME
                  </span>
                </label>

                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-leaf-50 border border-leaf-200 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-leaf-800 font-bold">
                      <Check className="w-4 h-4" />
                      <span>Code: {appliedVoucher.code}</span>
                      <span className="text-[11px] font-medium text-leaf-600">
                        (
                        {appliedVoucher.type === "percent"
                          ? `${appliedVoucher.discount}% OFF`
                          : `Rs. ${appliedVoucher.discount} OFF`}
                        )
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-stone-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyVoucher} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo coupon..."
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {voucherError && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {voucherError}
                  </p>
                )}
              </div>

              {/* Reward coins switch (balance comes from the server) */}
              {storeConfig.coinsEnabled && coinBalance > 0 && (
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between p-3 bg-gold-50/70 border border-gold-200/80 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gold-200 flex items-center justify-center text-gold-800 shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">
                          Redeem reward coins
                        </p>
                        <p className="text-[10px] text-stone-500">
                          Balance: <strong>{coinBalance} coins</strong>{" "}
                          (up to {rewards.maxRedeemPercent}% of the order can be paid with coins)
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyCoins}
                        onChange={(e) => setApplyCoins(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Pricing breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-stone-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-leaf-700 font-semibold">
                    <span>Voucher ({appliedVoucher.code}):</span>
                    <span>Rs. {voucherDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                {paymentDiscountAmount > 0 && (
                  <div className="flex justify-between text-leaf-700 font-semibold">
                    <span>
                      {activePaymentMethod.name.split(" ")[0]} (
                      {paymentDiscountPercent}% OFF):
                    </span>
                    <span>Rs. {paymentDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                {applyCoins && coinDiscountAmount > 0 && (
                  <div className="flex justify-between text-gold-700 font-semibold">
                    <span>Reward coins ({pricing.coinsUsed}):</span>
                    <span>- Rs. {coinDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Nationwide Courier:</span>
                  <span className="font-bold text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-md font-bold">
                        FREE
                      </span>
                    ) : (
                      `Rs. ${shippingFee}`
                    )}
                  </span>
                </div>

                {subtotal < shipping.freeThreshold && (
                  <p className="text-[10px] text-gold-700 italic">
                    Tip: Add Rs. {(shipping.freeThreshold - subtotal).toLocaleString()} more for
                    Free Delivery!
                  </p>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 text-base">
                  <span className="font-bold text-stone-900">
                    Total Payable:
                  </span>
                  <span className="text-2xl font-display font-extrabold text-heading">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {!orders.acceptingOrders && (
                <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {orders.closedMessage}
                </p>
              )}
              {orders.acceptingOrders && subtotal < orders.minOrderAmount && (
                <p role="alert" className="rounded-xl bg-gold-50 px-4 py-3 text-xs font-semibold text-gold-800">
                  Minimum order amount is Rs. {orders.minOrderAmount.toLocaleString()}. Add Rs.{" "}
                  {(orders.minOrderAmount - subtotal).toLocaleString()} more to continue.
                </p>
              )}

              {/* Confirm Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !ordersOpen}
                className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-stone-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      Confirm Order (Rs. {grandTotal.toLocaleString()})
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
