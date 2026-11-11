import { redirect } from "next/navigation";
import { getStaffWith, type StaffAccess } from "@/lib/admin";
import type { PermissionKey } from "@/lib/permissions";

/** For admin pages: sends staff without the right permission back to the admin home. */
export async function requirePage(need: PermissionKey | PermissionKey[] | "owner"): Promise<StaffAccess> {
  const staff = await getStaffWith(need);
  if (!staff) redirect("/admin");
  return staff;
}
