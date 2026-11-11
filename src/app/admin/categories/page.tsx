import React from "react";
import { requirePage } from "@/lib/admin-page";
import { connectToDatabase } from "@/lib/mongodb";
import { getSettings } from "@/lib/settings";
import ProductModel from "@/models/Product";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  await requirePage("categories");
  await connectToDatabase();
  const [settings, rows] = await Promise.all([
    getSettings(),
    ProductModel.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);
  const productCounts: Record<string, number> = {};
  for (const r of rows) productCounts[r._id] = r.count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Categories</h1>
        <p className="mt-1 text-stone-600">
          Add new sections (for example Pickles or Jams), change titles, colours and order. The first category is shown large on the home page.
        </p>
      </div>
      <CategoriesManager initial={settings.categories} productCounts={productCounts} />
    </div>
  );
}
