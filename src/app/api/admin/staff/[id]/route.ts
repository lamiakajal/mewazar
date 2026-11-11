import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { isPermissionKey, type PermissionKey } from "@/lib/permissions";
import User from "@/models/User";

type Ctx = { params: Promise<{ id: string }> };

async function findModerator(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectToDatabase();
  // Only moderators can be changed here; admins (owners) are never touched
  return User.findOne({ _id: id, role: "moderator" });
}

/** Change what a moderator may do. */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await getStaffWith("owner"))) {
    return NextResponse.json({ error: "Only the owner can manage staff" }, { status: 403 });
  }
  const { id } = await params;
  const moderator = await findModerator(id);
  if (!moderator) return NextResponse.json({ error: "Moderator not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const permissions: PermissionKey[] = Array.from(
    new Set((Array.isArray(body.permissions) ? body.permissions : []).filter(isPermissionKey)),
  );
  if (permissions.length === 0) {
    return NextResponse.json({ error: "Choose at least one thing this person may do" }, { status: 400 });
  }

  moderator.permissions = permissions;
  await moderator.save();
  await logAction("staff.update", `${moderator.email}: ${permissions.join(", ")}`);
  return NextResponse.json({ ok: true });
}

/** Remove moderator access. The account stays, as a normal customer. */
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getStaffWith("owner"))) {
    return NextResponse.json({ error: "Only the owner can manage staff" }, { status: 403 });
  }
  const { id } = await params;
  const moderator = await findModerator(id);
  if (!moderator) return NextResponse.json({ error: "Moderator not found" }, { status: 404 });

  moderator.role = "customer";
  moderator.permissions = [];
  await moderator.save();
  await logAction("staff.remove", moderator.email);
  return NextResponse.json({ ok: true });
}
