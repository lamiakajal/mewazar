import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { requirePage } from "@/lib/admin-page";
import User from "@/models/User";
import StaffManager, { StaffMember } from "@/components/admin/StaffManager";

export default async function AdminStaffPage() {
  await requirePage("owner");
  await connectToDatabase();
  const docs = await User.find({ role: { $in: ["admin", "moderator"] } })
    .select("name email role permissions")
    .sort({ role: 1, createdAt: 1 })
    .lean();
  const staff = JSON.parse(JSON.stringify(docs)) as StaffMember[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Staff</h1>
        <p className="mt-1 text-stone-600">
          Add helpers (moderators) and choose exactly what each one may do. You can change or remove access at any time.
        </p>
      </div>
      <StaffManager staff={staff} />
    </div>
  );
}
