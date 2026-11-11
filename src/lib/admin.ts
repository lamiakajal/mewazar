import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { PERMISSION_KEYS, type PermissionKey } from "@/lib/permissions";

export interface StaffAccess {
  email: string;
  name: string;
  role: "admin" | "moderator";
  permissions: PermissionKey[];
}

/**
 * The signed-in staff member (owner or moderator), or null.
 * The role and permissions are read from the database on every call, so changes
 * made by the owner take effect immediately. Staff must have signed in with
 * Google or GitHub (a verified email), never with a password.
 */
export async function getStaff(): Promise<StaffAccess | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  const provider = (session?.user as { provider?: string } | undefined)?.provider;
  if (provider === "credentials") return null;

  try {
    await connectToDatabase();
    const user = await User.findOne({ email, role: { $in: ["admin", "moderator"] } })
      .select("name role permissions")
      .lean<{ name: string; role: "admin" | "moderator"; permissions?: string[] }>();
    if (!user) return null;

    const permissions =
      user.role === "admin"
        ? PERMISSION_KEYS
        : PERMISSION_KEYS.filter((key) => user.permissions?.includes(key));
    return { email, name: user.name, role: user.role, permissions };
  } catch {
    return null;
  }
}

/**
 * Staff member who may do the given thing, or null.
 * "owner" means admin only. A list means any one of the permissions is enough.
 */
export async function getStaffWith(need: PermissionKey | PermissionKey[] | "owner"): Promise<StaffAccess | null> {
  const staff = await getStaff();
  if (!staff) return null;
  if (staff.role === "admin") return staff;
  if (need === "owner") return null;
  const needs = Array.isArray(need) ? need : [need];
  return needs.some((key) => staff.permissions.includes(key)) ? staff : null;
}

/** Email of the signed-in owner (admin), or null. */
export async function getAdminEmail(): Promise<string | null> {
  const staff = await getStaffWith("owner");
  return staff?.email ?? null;
}
