import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { allProducts } from "@/data/products";

/** One-time import of the starter catalog into MongoDB. Skips products that already exist. */
export async function POST(req: Request) {
  if (!(await getStaffWith("products"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();

  // "photos": give products that still show an illustration their starter photo, and
  // put the best-looking products first. Photos you uploaded yourself are never replaced.
  if (body.mode === "photos") {
    const current = await ProductModel.find().select("id images").lean<{ id: string; images?: string[] }[]>();
    const byId = new Map(current.map((p) => [p.id, p.images ?? []]));

    const operations = allProducts
      .filter((p) => byId.has(p.id))
      .map((p, index) => {
        const stillIllustrated = (byId.get(p.id) ?? []).every((src) => src.startsWith("art:"));
        const starterHasPhoto = !p.images[0].startsWith("art:");
        return {
          updateOne: {
            filter: { id: p.id },
            update: {
              $set: {
                sortOrder: index + 1,
                isFeatured: !!p.isFeatured,
                ...(stillIllustrated && starterHasPhoto ? { images: p.images } : {}),
              },
            },
          },
        };
      });

    if (operations.length) await ProductModel.bulkWrite(operations);
    await logAction("products.photos", `${operations.length} products updated`);
    revalidatePath("/", "layout");
    return NextResponse.json({ updated: operations.length });
  }
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
