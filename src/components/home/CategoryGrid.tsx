import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductArt from "@/components/ui/ProductArt";
import ProductImage from "@/components/ui/ProductImage";
import Reveal from "@/components/ui/Reveal";
import type { CategoryMeta } from "@/data/categories";
import type { Product } from "@/types";

export default function CategoryGrid({ products, categories }: { products: Product[]; categories: CategoryMeta[] }) {
  const countFor = (name: string) => products.filter((p) => p.category === name).length;
  const [feature, ...rest] = categories;

  // Tile photo: the owner's cover photo, otherwise the first real photo of a product in that category
  const coverFor = (cat: CategoryMeta): string | null => {
    if (cat.image) return cat.image;
    const withPhoto = products.find((p) => p.category === cat.name && p.images[0] && !p.images[0].startsWith("art:"));
    return withPhoto ? withPhoto.images[0] : null;
  };
  const featureCover = coverFor(feature);

  return (
    <section className="py-16 sm:py-24" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2
              id="categories-heading"
              className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-5xl"
            >
              Everything for a fuller pantry
            </h2>
            <p className="mt-3 max-w-xl text-stone-600">
              From wild honey to desi ghee, choose a category and see what is
              fresh this season.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-bold text-heading md:self-end"
          >
            Shop everything
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-[repeat(4,minmax(0,1fr))]">
          {/* Featured category */}
          <Reveal className="col-span-2 row-span-2 lg:row-span-2">
            <Link
              href={`/shop?cat=${feature.slug}`}
              className="group relative flex h-full min-h-[18rem] flex-col justify-end overflow-hidden rounded-3xl border border-stone-200/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8"
              style={{ background: `linear-gradient(160deg, ${feature.from}55, ${feature.to}99)` }}
            >
              <div className="absolute inset-x-0 top-0 h-[78%] transition-transform duration-700 group-hover:scale-105">
                {featureCover ? (
                  <ProductImage src={featureCover} alt={feature.label} fallbackSlug={feature.slug} sizes="(max-width: 1024px) 100vw, 50vw" />
                ) : (
                  <ProductArt slug={feature.slug} categories={categories} className="bg-transparent" />
                )}
              </div>
              <div className="relative rounded-2xl bg-surface/90 p-5 backdrop-blur">
                <h3 className="font-display text-2xl font-extrabold text-stone-900">{feature.label}</h3>
                <p className="mt-1 text-sm text-stone-600">{feature.blurb}</p>
                <p className="mt-3 flex items-center justify-between text-sm font-bold text-heading">
                  <span>{countFor(feature.name)} products</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          </Reveal>

          {rest.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 40} className="lg:row-span-1">
              <Link
                href={`/shop?cat=${cat.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lift"
              >
                <div className="relative aspect-[5/3] overflow-hidden">
                  <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-110">
                    {coverFor(cat) ? (
                      <ProductImage src={coverFor(cat) as string} alt={cat.label} fallbackSlug={cat.slug} sizes="(max-width: 640px) 50vw, 25vw" />
                    ) : (
                      <ProductArt slug={cat.slug} categories={categories} />
                    )}
                  </div>
                  {cat.badge && (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {cat.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-stone-900">{cat.label}</h3>
                    <p className="text-xs text-stone-500">{countFor(cat.name)} products</p>
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-800 transition-colors group-hover:bg-primary group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
