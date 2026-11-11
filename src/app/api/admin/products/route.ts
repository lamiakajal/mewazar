import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { parseProductInput } from "@/lib/product-input";
import { getSettings } from "@/lib/settings";
import ProductModel from "@/models/Product";

const unauthorized = () => NextResponse.json({ error: "Admin access required" }, { status: 403 });

export async function GET() {
  if (!(await getStaffWith("products"))) return unauthorized();
  await connectToDatabase();
  const products = await ProductModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await getStaffWith("products"))) return unauthorized();

  const parsed = parseProductInput(await req.json().catch(() => null), (await getSettings()).categories);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await connectToDatabase();
    const created = await ProductModel.create({
      ...parsed.data,
      id: `prod-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      sortOrder: (await ProductModel.countDocuments()) + 1,
    });
    revalidatePath("/", "layout");
    await logAction("product.create", created.name);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Another product already uses this slug" }, { status: 409 });
    }
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Could not create the product" }, { status: 500 });
  }
}
