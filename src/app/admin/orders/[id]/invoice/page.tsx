import React from "react";
import { requirePage } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { BRAND } from "@/data/brand";
import Order from "@/models/Order";
import PrintButton from "@/components/admin/PrintButton";

export const metadata = { title: "Invoice", robots: { index: false } };

/** Printable invoice and packing slip. Use the browser's Print (or Save as PDF). */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("orders");
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectToDatabase();
  const [order, settings] = await Promise.all([Order.findById(id).lean(), getSettings()]);
  if (!order) notFound();

  const a = order.shippingAddress;

  return (
    <div className="invoice-print mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 text-stone-900 shadow-soft print:border-0 print:shadow-none">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-800">{BRAND.name}</h1>
          <p className="text-xs text-stone-500">
            {settings.contact.phone} &middot; {settings.contact.supportEmail}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">Invoice {order.orderNumber}</p>
          <p className="text-stone-500">{new Date(order.createdAt).toLocaleDateString("en-PK")}</p>
          <p className="text-stone-500">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
        </div>
      </div>

      <div className="mb-6 text-sm">
        <p className="font-bold">Deliver to</p>
        <p>{a.fullName}</p>
        <p>
          {a.address}, {a.city} {a.postalCode}
        </p>
        <p>{a.phone}</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-left text-xs text-stone-500">
            <th className="py-2">Item</th>
            <th className="py-2">Pack</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i: { name: string; weight: string; quantity: number; price: number }, idx: number) => (
            <tr key={idx} className="border-b border-stone-100">
              <td className="py-2">{i.name}</td>
              <td className="py-2">{i.weight}</td>
              <td className="py-2 text-right">{i.quantity}</td>
              <td className="py-2 text-right">{formatPrice(i.price * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 text-right text-sm">
        <p>Subtotal: {formatPrice(order.subtotal)}</p>
        <p>Discount: -{formatPrice(order.discount)}</p>
        <p>Delivery: {order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}</p>
        <p className="text-lg font-extrabold">
          Total{order.paymentMethod === "cod" ? " to collect" : ""}: {formatPrice(order.totalAmount)}
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-stone-500">Thank you for shopping with {BRAND.name}.</p>
      <div className="mt-6 flex justify-center print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
