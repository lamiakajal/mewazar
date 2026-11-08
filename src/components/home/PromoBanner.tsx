import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import FloatingHexes from "@/components/ui/FloatingHexes";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";

/** Promo banner. The text and the featured coupon are edited in /admin/settings. */
export default async function PromoBanner() {
  const { sale, vouchers } = await getSettings();
  if (!sale.enabled) return null;

  const today = new Date();
  const voucher = vouchers.find(
    (v) =>
      v.isActive &&
      v.showOnHome &&
      (!v.expiresAt || new Date(`${v.expiresAt}T23:59:59`) >= today),
  );

  return (
    <section className="px-4 sm:px-6 lg:px-8" aria-label="Special offer">
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-800 via-brand-900 to-brand-950 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
        <div className="hex-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <FloatingHexes />
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative text-white">
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            {sale.headline}
          </h2>
          <p className="mt-4 max-w-md text-white/75">{sale.subtext}</p>

          {voucher && (
            <p className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-glow-400/70 bg-white/10 px-4 py-3 text-sm backdrop-blur">
              <span className="rounded-lg bg-gold-500 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-gold-ink">
                {voucher.code}
              </span>
              <span className="text-white/85">
                {voucher.type === "percent" ? `${voucher.discount}% off` : `${formatPrice(voucher.discount)} off`} orders over{" "}
                {formatPrice(voucher.minSpend)}
              </span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop?cat=gift-boxes"
              className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-gold-ink transition hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Shop gift boxes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop?cat=sale"
              className="inline-flex items-center rounded-full border-2 border-white/30 px-7 py-[0.8rem] text-sm font-bold text-white transition hover:border-glow-400 hover:text-glow-300"
            >
              See all sale items
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-md">
          <div className="animate-float-slow absolute inset-0 overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
            <ProductImage
              src="art:gift-boxes:gift"
              alt="Mewazar gift box"
              sizes="(max-width: 1024px) 90vw, 450px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
