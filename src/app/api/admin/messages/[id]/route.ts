import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getStaffWith } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import ContactMessageModel from "@/models/ContactMessage";

type Ctx = { params: Promise<{ id: string }> };

async function guard(id: string) {
  if (!(await getStaffWith("messages"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectToDatabase();
  return null;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const blocked = await guard(id);
  if (blocked) return blocked;
  const body = await req.json().catch(() => ({}));
  await ContactMessageModel.findByIdAndUpdate(id, { read: !!body.read });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const blocked = await guard(id);
  if (blocked) return blocked;
  await ContactMessageModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
