import React from "react";
import { CheckCircle2, PhoneCall, RefreshCcw, ShieldCheck, Star, Truck } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import AutoCarousel from "@/components/ui/AutoCarousel";
import { BRAND } from "@/data/brand";
import { SAMPLE_REVIEWS } from "@/data/sample-reviews";
import { getLatestReviews } from "@/lib/reviews";
import { getSettings } from "@/lib/settings";

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Raw and pure",
    description: "No added sugar, heat treatment or artificial preservatives.",
  },
  {
    icon: Truck,
    title: "Cash on Delivery",
    description: `Pay at your doorstep anywhere in ${BRAND.country}.`,
  },
  {
    icon: RefreshCcw,
    title: "Freshness promise",
    description: "Not happy with freshness? Get a replacement within 7 days.",
  },
  {
    icon: PhoneCall,
    title: "WhatsApp support",
    description: "Ask us anything, or place bulk orders directly on WhatsApp.",
  },
];

interface Testimonial {
  key: string;
  name: string;
  city: string;
  product: string;
  comment: string;
  rating: number;
  rtl: boolean;
  /** Only genuine reviews from signed-in buyers carry this badge. */
  verified: boolean;
}

const MIN_CARDS = 12;

export default async function Reviews() {
  const [real, settings] = await Promise.all([getLatestReviews(MIN_CARDS), getSettings()]);

  // Real approved reviews always come first
  const cards: Testimonial[] = real.map((r) => ({
    key: `real-${r.id}`,
    name: r.name,
    city: r.city || BRAND.country,
    product: r.productName,
    comment: r.comment,
    rating: r.rating,
    rtl: /[\u0600-\u06FF]/.test(r.comment),
    verified: r.verifiedBuyer,
  }));

  // Sample testimonials only fill the gap while the owner keeps them switched on
  if (settings.home.showSampleReviews && cards.length < MIN_CARDS) {
    for (const s of SAMPLE_REVIEWS) {
      if (cards.length >= MIN_CARDS + 2) break;
      cards.push({
        key: `sample-${s.name}`,
        name: s.name,
        city: s.city,
        product: s.product,
        comment: s.comment,
        rating: s.rating,
        rtl: s.lang === "ur",
        verified: false,
      });
    }
  }

  return (
    <>
      {/* Trust strip */}
      <section className="border-y border-stone-200/70 bg-stone-100/60 py-10" aria-label="Why shop with us">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-700">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-stone-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer reviews carousel */}
      {cards.length > 0 && (
        <section className="py-16 sm:py-24" aria-labelledby="reviews-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2
                id="reviews-heading"
                className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-5xl"
              >
                Loved by families across {BRAND.country}
              </h2>
              <p className="mt-3 text-stone-600">
                Words from people who bring {settings.brand.name} to their breakfast tables and gift lists.
              </p>
            </div>

            <AutoCarousel label="Customer reviews" intervalMs={3500} className="scroll-pl-1 px-1 pb-4">
              {cards.map((c) => (
                <figure
                  key={c.key}
                  className="flex w-[85%] shrink-0 snap-start flex-col justify-between rounded-3xl border border-stone-200/80 bg-surface p-7 transition-shadow hover:shadow-lift sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                >
                  <div>
                    <div className="mb-4 flex gap-0.5 text-gold-500" aria-label={`${c.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= c.rating ? "fill-current" : "text-stone-300"}`} />
                      ))}
                    </div>
                    <blockquote
                      dir={c.rtl ? "rtl" : "ltr"}
                      lang={c.rtl ? "ur" : "en"}
                      className={`text-stone-700 ${c.rtl ? "font-urdu text-[17px] leading-loose" : "text-[15px] leading-relaxed"}`}
                    >
                      &ldquo;{c.comment}&rdquo;
                    </blockquote>
                  </div>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-4">
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold text-stone-900">{c.name}</p>
                      <p className="truncate text-xs text-stone-500">
                        {c.city} &middot; {c.product}
                      </p>
                    </div>
                    {c.verified && (
                      <span className="flex shrink-0 items-center gap-1 rounded-md bg-leaf-100 px-2 py-1 text-[11px] font-bold text-leaf-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </AutoCarousel>
          </div>
        </section>
      )}
    </>
  );
}
