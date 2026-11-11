import React from "react";
import { requirePage } from "@/lib/admin-page";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import ProductEditor from "@/components/admin/ProductEditor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("products");
  const { id } = await params;
  await connectToDatabase();
  const product = await ProductModel.findOne({ id }).lean();
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-heading">Edit product</h1>
      <ProductEditor
        id={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          category: product.category,
          description: product.description,
          images: product.images,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          variants: product.variants.map((v) => ({ weight: v.weight, price: v.price, comparePrice: v.comparePrice, stock: v.stock })),
          isFeatured: !!product.isFeatured,
          isNew: !!product.isNewArrival,
          active: product.active !== false,
        }}
      />
    </div>
  );
}
