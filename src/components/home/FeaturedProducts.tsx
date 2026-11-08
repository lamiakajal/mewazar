import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import AutoCarousel from "@/components/ui/AutoCarousel";
import type { Product } from "@/types";

/** Best sellers grid followed by a swipeable row of new arrivals. */
interface FeaturedProductsProps {
  bestSellers: Product[];
  newArrivals: Product[];
}

export default function FeaturedProducts({ bestSellers, newArrivals }: FeaturedProductsProps) {
  return (
    <>
      <section className="bg-stone-100/60 py-16 sm:py-24" aria-labelledby="best-sellers-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2
                id="best-sellers-heading"
                className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-5xl"
              >
                Best sellers this season
              </h2>
              <p className="mt-3 max-w-xl text-stone-600">
                The jars, boxes and packs our customers reorder most. Pick a
                pack size and add it in one tap.
              </p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 self-start text-sm font-bold text-heading md:self-end"
            >
              View all products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard product={product} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
      <section className="py-16 sm:py-24" aria-labelledby="new-arrivals-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2
              id="new-arrivals-heading"
              className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-5xl"
            >
              Just arrived
            </h2>
            <p className="hidden text-sm font-semibold text-stone-500 sm:block">
              Moves on its own. Hover to pause.
            </p>
          </div>
        </div>

        {/* Moves one card at a time every couple of seconds, then starts over */}
        <AutoCarousel
          label="New arrivals"
          intervalMs={2200}
          className="scroll-pl-4 px-4 pb-6 sm:scroll-pl-6 sm:px-6 lg:scroll-pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {newArrivals.map((product) => (
            <div key={product.id} className="w-68 shrink-0 snap-start sm:w-76">
              <ProductCard product={product} />
            </div>
          ))}
        </AutoCarousel>
      </section>
      )}
    </>
  );
}
