import { NextResponse } from "next/server";
import { getStaffWith } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admin-emails";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { isPermissionKey, type PermissionKey } from "@/lib/permissions";
import User from "@/models/User";

const cleanPermissions = (value: unknown): PermissionKey[] =>
  Array.from(new Set((Array.isArray(value) ? value : []).filter(isPermissionKey)));

/** Owner adds a moderator by email. They sign in with Google or GitHub using that email. */
export async function POST(req: Request) {
  if (!(await getStaffWith("owner"))) {
    return NextResponse.json({ error: "Only the owner can manage staff" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 120);
  const permissions = cleanPermissions(body.permissions);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (permissions.length === 0) {
    return NextResponse.json({ error: "Choose at least one thing this person may do" }, { status: 400 });
  }
  if (isAdminEmail(email)) {
    return NextResponse.json({ error: "That email already belongs to the owner" }, { status: 400 });
  }

  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing?.role === "admin") {
    return NextResponse.json({ error: "That person is already an admin" }, { status: 400 });
  }

  if (existing) {
    existing.role = "moderator";
    existing.permissions = permissions;
    await existing.save();
  } else {
    // Placeholder account; it becomes theirs when they first sign in with this email
    await User.create({
      name: email.split("@")[0],
      email,
      provider: "google",
      role: "moderator",
      permissions,
    });
  }

  await logAction("staff.add", `${email}: ${permissions.join(", ")}`);
  return NextResponse.json({ ok: true }, { status: 201 });
}
