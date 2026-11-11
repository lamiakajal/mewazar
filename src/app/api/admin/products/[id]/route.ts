import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { parseProductInput } from "@/lib/product-input";
import { getSettings } from "@/lib/settings";
import ProductModel from "@/models/Product";
import { deleteUnusedUploads } from "@/lib/image-cleanup";

type Ctx = { params: Promise<{ id: string }> };
const unauthorized = () => NextResponse.json({ error: "Admin access required" }, { status: 403 });

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await getStaffWith("products"))) return unauthorized();
  const { id } = await params;

  const parsed = parseProductInput(await req.json().catch(() => null), (await getSettings()).categories);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await connectToDatabase();
    const previous = await ProductModel.findOne({ id }).select("images").lean();
    const updated = await ProductModel.findOneAndUpdate({ id }, parsed.data, { new: true });
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await deleteUnusedUploads(previous?.images ?? [], parsed.data.images);
    revalidatePath("/", "layout");
    await logAction("product.update", updated.name);
    return NextResponse.json({ product: updated });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Another product already uses this slug" }, { status: 409 });
    }
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Could not update the product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getStaffWith("products"))) return unauthorized();
  const { id } = await params;

  await connectToDatabase();
  const previous = await ProductModel.findOne({ id }).select("images").lean();
  const result = await ProductModel.deleteOne({ id });
  if (result.deletedCount !== 1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await deleteUnusedUploads(previous?.images ?? [], []);
  revalidatePath("/", "layout");
  await logAction("product.delete", id);
  return NextResponse.json({ ok: true });
}
