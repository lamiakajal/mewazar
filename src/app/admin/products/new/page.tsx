import React from "react";
import { requirePage } from "@/lib/admin-page";
import ProductEditor from "@/components/admin/ProductEditor";

export default async function NewProductPage() {
  await requirePage("products");
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-heading">Add product</h1>
      <ProductEditor />
    </div>
  );
}
