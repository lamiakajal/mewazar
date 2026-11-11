import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { allProducts } from "@/data/products";

/** One-time import of the starter catalog into MongoDB. Skips products that already exist. */
export async function POST() {
  if (!(await getStaffWith("products"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  await connectToDatabase();
  const existing = new Set((await ProductModel.find().select("id").lean()).map((p) => p.id));

  const fresh = allProducts
    .filter((p) => !existing.has(p.id))
    .map((p, i) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      images: p.images,
      description: p.description,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      variants: p.variants,
      isFeatured: !!p.isFeatured,
      isNewArrival: !!p.isNew,
      active: true,
      sortOrder: i + 1,
    }));

  if (fresh.length) await ProductModel.insertMany(fresh, { ordered: false });
  revalidatePath("/", "layout");
  return NextResponse.json({ imported: fresh.length });
}
