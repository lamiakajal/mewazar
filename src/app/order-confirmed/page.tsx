import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };

const COPY = {
  paid: { icon: CheckCircle2, tone: "text-leaf-600", title: "Payment received", text: "Thank you! We are preparing your order." },
  pending: { icon: Clock, tone: "text-gold-600", title: "Waiting for payment confirmation", text: "Your payment is being confirmed. This can take a few minutes. We will email you when it is done." },
  failed: { icon: XCircle, tone: "text-rose-600", title: "Payment was not completed", text: "Your order is saved but the payment did not go through. Please contact us on WhatsApp to pay another way." },
  error: { icon: XCircle, tone: "text-rose-600", title: "We could not read the payment result", text: "If money left your account, please contact us on WhatsApp with your order number." },
} as const;

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const { order = "", status = "error" } = await searchParams;
  const view = COPY[status as keyof typeof COPY] ?? COPY.error;
  const Icon = view.icon;

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Icon className={`mx-auto h-16 w-16 ${view.tone}`} />
      <h1 className="mt-4 font-display text-3xl font-extrabold text-heading">{view.title}</h1>
      <p className="mt-3 text-stone-600">{view.text}</p>
      {order && (
        <p className="mt-4 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
          Order number: <strong>{order}</strong>
        </p>
      )}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/track" className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-white hover:bg-primary-hover">
          Track my order
        </Link>
        <Link href="/shop" className="rounded-full border-2 border-stone-300 px-7 py-[0.7rem] text-sm font-bold text-stone-800 hover:border-gold-500">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
