"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import ProductArt from "@/components/ui/ProductArt";
import { slugify } from "@/lib/product-input";
import type { ArtKind, CategoryMeta } from "@/data/categories";

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

const ART_LABELS: Record<ArtKind, string> = {
  jar: "Jar",
  pouch: "Pouch / bag",
  bottle: "Bottle",
  box: "Box",
  tin: "Tin",
};

/** Add, rename, recolour, reorder and remove shop categories. */
export default function CategoriesManager({
  initial,
  productCounts,
}: {
  initial: CategoryMeta[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CategoryMeta[]>(initial);
  const [existing] = useState(() => new Set(initial.map((c) => c.name)));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const patch = (i: number, p: Partial<CategoryMeta>) =>
    setItems((prev) => prev.map((c, j) => (j === i ? { ...c, ...p } : c)));

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const add = () =>
    setItems((prev) => [
      ...prev,
      { slug: `new-category-${prev.length + 1}`, name: "", label: "", blurb: "", art: "pouch", from: "#E8C9A0", to: "#C99863" },
    ]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save");
      setMessage({ text: "Saved. Your store now shows these categories.", ok: true });
      router.refresh();
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Could not save", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((c, i) => {
        const isExisting = existing.has(c.name);
        const count = productCounts[c.name] ?? 0;
        return (
          <div key={i} className="grid gap-4 rounded-2xl border border-stone-200 bg-surface p-4 shadow-soft sm:grid-cols-[7rem_1fr_auto]">
            <div className="relative aspect-square w-28 overflow-hidden rounded-xl border border-stone-200">
              <ProductArt slug={c.slug} categories={[c]} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-stone-600">
                Category name {isExisting && <span className="font-normal text-stone-400">(fixed, products use it)</span>}
                <input
                  value={c.name}
                  disabled={isExisting}
                  onChange={(e) => {
                    const name = e.target.value;
                    patch(i, { name, ...(isExisting ? {} : { slug: slugify(name) || c.slug, label: c.label || name }) });
                  }}
                  className={`${inputClass} mt-1 disabled:opacity-60`}
                  maxLength={40}
                />
              </label>
              <label className="text-xs font-bold text-stone-600">
                Title shown to customers
                <input value={c.label} onChange={(e) => patch(i, { label: e.target.value })} className={`${inputClass} mt-1`} maxLength={40} />
              </label>
              <label className="text-xs font-bold text-stone-600 sm:col-span-2">
                Short description
                <input value={c.blurb} onChange={(e) => patch(i, { blurb: e.target.value })} className={`${inputClass} mt-1`} maxLength={160} />
              </label>
              <label className="text-xs font-bold text-stone-600">
                Picture style
                <select value={c.art} onChange={(e) => patch(i, { art: e.target.value as ArtKind })} className={`${inputClass} mt-1`}>
                  {(Object.keys(ART_LABELS) as ArtKind[]).map((k) => (
                    <option key={k} value={k}>
                      {ART_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs font-bold text-stone-600">
                  Colour 1
                  <input type="color" value={c.from} onChange={(e) => patch(i, { from: e.target.value })} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-stone-300" />
                </label>
                <label className="text-xs font-bold text-stone-600">
                  Colour 2
                  <input type="color" value={c.to} onChange={(e) => patch(i, { to: e.target.value })} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-stone-300" />
                </label>
                <label className="text-xs font-bold text-stone-600">
                  Badge
                  <input value={c.badge ?? ""} onChange={(e) => patch(i, { badge: e.target.value })} className={`${inputClass} mt-1`} placeholder="Sale" maxLength={12} />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
                <label className="min-w-0 flex-1 text-xs font-bold text-stone-600">
                  Cover photo (optional)
                  <input
                    value={c.image ?? ""}
                    onChange={(e) => patch(i, { image: e.target.value })}
                    className={`${inputClass} mt-1`}
                    placeholder="Leave empty to use the best product photo"
                  />
                </label>
                <label className="cursor-pointer rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:border-gold-500">
                  Upload
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const body = new FormData();
                      body.append("file", file);
                      const res = await fetch("/api/admin/upload", { method: "POST", body });
                      const data = await res.json().catch(() => ({}));
                      if (res.ok) patch(i, { image: data.url });
                      else setMessage({ text: data.error || "Upload failed", ok: false });
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-stone-500 sm:col-span-2">
                Web address: /shop?cat={c.slug} &middot; {count} product{count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex gap-1 sm:flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                disabled={count > 0 || items.length === 1}
                aria-label="Remove category"
                title={count > 0 ? "Move or delete its products first" : "Remove"}
                className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:border-gold-500 cursor-pointer">
        <Plus className="h-3.5 w-3.5" /> Add category
      </button>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-surface/95 p-4 shadow-lift backdrop-blur">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60 cursor-pointer">
          {saving ? "Saving..." : "Save categories"}
        </button>
        {message && (
          <p role="status" className={`text-sm font-semibold ${message.ok ? "text-leaf-700" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
