import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { recomputeProductRating } from "@/lib/reviews";
import ReviewModel from "@/models/Review";

type Ctx = { params: Promise<{ id: string }> };

async function guard(id: string) {
  if (!(await getStaffWith("reviews"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
  }
  await connectToDatabase();
  return null;
}

/** Approve (publish) or unpublish a review. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const blocked = await guard(id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => ({}));
  if (body.status !== "approved" && body.status !== "pending") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const review = await ReviewModel.findByIdAndUpdate(id, { status: body.status }, { new: true });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await logAction("review.update", `${review.productName}: ${body.status}`);
  await recomputeProductRating(review.productId);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const blocked = await guard(id);
  if (blocked) return blocked;

  const review = await ReviewModel.findByIdAndDelete(id);
  await logAction("review.delete", review ? review.productName : id);
  if (review) await recomputeProductRating(review.productId);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
