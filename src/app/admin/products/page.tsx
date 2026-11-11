import React from "react";
import { requirePage } from "@/lib/admin-page";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/format";
import ProductModel from "@/models/Product";
import ProductImage from "@/components/ui/ProductImage";
import SeedButton from "@/components/admin/SeedButton";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { categoryByName } from "@/data/categories";
import { getSettings } from "@/lib/settings";

export default async function AdminProducts() {
  await requirePage("products");
  await connectToDatabase();
  const [products, { categories }] = await Promise.all([
    ProductModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-heading">Products</h1>
          <p className="mt-1 text-stone-600">{products.length} products. Changes go live within a minute.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-surface p-8 text-center">
          <p className="mb-4 text-stone-600">
            No products in the database yet. Import the 50 starter products to begin editing them.
          </p>
          <div className="flex justify-center">
            <SeedButton />
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-surface shadow-soft">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs font-bold text-stone-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Packs (price / stock)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        <ProductImage
                          src={p.images[0] ?? ""}
                          alt={p.name}
                          fallbackSlug={categoryByName(p.category, categories)?.slug}
                          sizes="48px"
                        />
                      </div>
                      <Link href={`/admin/products/${p.id}`} className="font-bold text-stone-800 hover:underline">
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {p.variants.map((v) => (
                        <li key={v.weight} className="flex items-center gap-2 text-xs">
                          <span className="w-16 font-semibold text-stone-700">{v.weight}</span>
                          <span className="text-stone-600">{formatPrice(v.price)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-bold ${
                              v.stock === 0
                                ? "bg-rose-100 text-rose-700"
                                : v.stock <= 5
                                  ? "bg-gold-100 text-gold-800"
                                  : "bg-leaf-100 text-leaf-700"
                            }`}
                          >
                            {v.stock}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        p.active === false ? "bg-stone-200 text-stone-600" : "bg-leaf-100 text-leaf-700"
                      }`}
                    >
                      {p.active === false ? "Hidden" : "Live"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label={`Edit ${p.name}`}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-heading"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
