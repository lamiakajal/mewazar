"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, MessageCircle, Printer } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { trackingLink } from "@/lib/tracking";
import type { CourierOption } from "@/lib/settings-types";

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: { productId: string; name: string; weight: string; price: number; quantity: number }[];
  shippingAddress: { fullName: string; phone: string; email: string; address: string; city: string };
  paymentMethod: string;
  paymentStatus: "pending" | "verified" | "failed" | "refunded";
  adminNote?: string;
  isGuest?: boolean;
  paymentGateway?: string;
  transactionId?: string;
  voucherCode?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: "placed" | "processing" | "dispatched" | "delivered" | "cancelled";
  courier?: string;
  trackingId?: string;
}

const STATUSES = ["placed", "processing", "dispatched", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["pending", "verified", "failed", "refunded"] as const;

const STATUS_STYLE: Record<string, string> = {
  placed: "bg-gold-100 text-gold-800",
  processing: "bg-brand-100 text-brand-800",
  dispatched: "bg-brand-100 text-brand-800",
  delivered: "bg-leaf-100 text-leaf-700",
  cancelled: "bg-rose-100 text-rose-700",
  pending: "bg-gold-100 text-gold-800",
  verified: "bg-leaf-100 text-leaf-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-stone-200 text-stone-700",
};

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

/** Turns 03xx... or +92 3xx... into digits for a wa.me link. */
const waDigits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `92${d.slice(1)}` : d;
};

const statusMessage = (o: AdminOrder, courier: string, trackingId: string) => {
  const name = o.shippingAddress.fullName;
  switch (o.orderStatus) {
    case "processing":
      return `Hi ${name}, your Mewazar order ${o.orderNumber} is being packed. We will update you when it ships.`;
    case "dispatched":
      return `Hi ${name}, your Mewazar order ${o.orderNumber} is on its way${courier ? ` with ${courier}` : ""}${trackingId ? ` (tracking ID: ${trackingId})` : ""}. Thank you for shopping with us!`;
    case "delivered":
      return `Hi ${name}, your Mewazar order ${o.orderNumber} has been delivered. We hope you enjoy it! Tell us how it was.`;
    case "cancelled":
      return `Hi ${name}, your Mewazar order ${o.orderNumber} has been cancelled. Please message us if you have any questions.`;
    default:
      return `Hi ${name}, thank you for your Mewazar order ${o.orderNumber}. We are confirming it now.`;
  }
};

function OrderCard({ order, couriers, onSaved }: { order: AdminOrder; couriers: CourierOption[]; onSaved: (o: AdminOrder) => void }) {
  const [open, setOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [courier, setCourier] = useState(order.courier ?? "");
  const [trackingId, setTrackingId] = useState(order.trackingId ?? "");
  const [adminNote, setAdminNote] = useState(order.adminNote ?? "");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const locked = order.orderStatus === "cancelled";
  const dirty =
    orderStatus !== order.orderStatus ||
    paymentStatus !== order.paymentStatus ||
    courier !== (order.courier ?? "") ||
    trackingId !== (order.trackingId ?? "") ||
    adminNote !== (order.adminNote ?? "");

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus, courier, trackingId, adminNote, notify }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update the order");
      onSaved({ ...order, ...data.order, _id: order._id, createdAt: order.createdAt });
      setMessage("Saved");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update the order");
    } finally {
      setSaving(false);
    }
  };

  const a = order.shippingAddress;

  return (
    <article className="rounded-2xl border border-stone-200 bg-surface shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <p className="font-bold text-stone-900">
            {order.orderNumber}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold ${
                order.isGuest ? "bg-stone-200 text-stone-700" : "bg-leaf-100 text-leaf-700"
              }`}
              title={order.isGuest ? "Placed without an account" : "Placed by a registered customer"}
            >
              {order.isGuest ? "Guest" : "Account"}
            </span>
          </p>
          <p className="truncate text-xs text-stone-500">
            <span suppressHydrationWarning>{new Date(order.createdAt).toLocaleString("en-PK")}</span> &middot;{" "}
            {a.fullName}, {a.city}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[order.paymentStatus]}`}>
          {order.paymentMethod} &middot; {order.paymentStatus}
        </span>
        <span className="font-extrabold text-stone-900">{formatPrice(order.totalAmount)}</span>
        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-stone-100 p-4 lg:grid-cols-2">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="mb-1 font-bold text-stone-800">Customer</h3>
              <p className="text-stone-600">
                {a.fullName}
                <br />
                {a.address}, {a.city}
                <br />
                {a.phone} &middot; {a.email}
              </p>
              <a
                href={`https://wa.me/${waDigits(a.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp customer
              </a>
              <a
                href={`https://wa.me/${waDigits(a.phone)}?text=${encodeURIComponent(statusMessage(order, courier, trackingId))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#25D366] px-3.5 py-1.5 text-xs font-bold text-[#128C7E]"
              >
                Send status update on WhatsApp
              </a>
              <a
                href={`/admin/orders/${order._id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 mt-2 inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:border-gold-500"
              >
                <Printer className="h-3.5 w-3.5" /> Invoice / packing slip
              </a>
            </div>

            <div>
              <h3 className="mb-1 font-bold text-stone-800">Items</h3>
              <ul className="divide-y divide-stone-100">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3 py-1.5 text-stone-600">
                    <span>
                      {i.name} ({i.weight}) x {i.quantity}
                    </span>
                    <span className="font-semibold text-stone-800">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right text-xs text-stone-500">
                Subtotal {formatPrice(order.subtotal)} &middot; Discount -{formatPrice(order.discount)}
                {order.voucherCode ? ` (${order.voucherCode})` : ""} &middot; Delivery{" "}
                {order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}
              </p>
            </div>

            {trackingLink(couriers, order.courier, order.trackingId) && (
              <p className="text-xs text-stone-600">
                Customer tracking page:{" "}
                <a href={trackingLink(couriers, order.courier, order.trackingId)} target="_blank" rel="noopener noreferrer" className="font-bold text-heading underline">
                  open
                </a>
              </p>
            )}

            {order.transactionId && (
              <p className="rounded-lg bg-gold-50 px-3 py-2 text-stone-700">
                Payment reference: <strong>{order.transactionId}</strong>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-stone-800">Update order</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold text-stone-600">
                Order status
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as AdminOrder["orderStatus"])}
                  disabled={locked}
                  className={`${inputClass} mt-1`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-stone-600">
                Payment
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as AdminOrder["paymentStatus"])}
                  className={`${inputClass} mt-1`}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-stone-600">
                Courier
                <input value={courier} onChange={(e) => setCourier(e.target.value)} className={`${inputClass} mt-1`} placeholder="e.g. TCS, Leopards" list="courier-options" />
              </label>
              <label className="text-xs font-bold text-stone-600">
                Tracking ID
                <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className={`${inputClass} mt-1`} />
              </label>
            </div>

            <label className="block text-xs font-bold text-stone-600">
              Private note (only you can see this)
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} maxLength={500} className={`${inputClass} mt-1`} />
            </label>

            {locked && (
              <p className="text-xs font-semibold text-rose-600">
                Cancelled orders cannot be reopened. Stock was returned to the shelf.
              </p>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-stone-600">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 accent-primary" />
              Email the customer when the order status changes
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={saving || !dirty}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              {message && <span className="text-sm font-semibold text-stone-600">{message}</span>}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function OrdersManager({ initialOrders, couriers }: { initialOrders: AdminOrder[]; couriers: CourierOption[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.orderStatus] = (c[o.orderStatus] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div className="space-y-5">
      <datalist id="courier-options">
        {couriers.map((c) => (
          <option key={c.name} value={c.name} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Order status">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition cursor-pointer ${
              filter === s
                ? "border-primary bg-primary text-white"
                : "border-stone-200 bg-surface text-stone-700 hover:border-gold-500"
            }`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-surface p-10 text-center text-stone-500">
          No orders here yet.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <OrderCard
              key={o._id}
              order={o}
              couriers={couriers}
              onSaved={(updated) => setOrders((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
