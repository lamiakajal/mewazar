import React from "react";
import { requirePage } from "@/lib/admin-page";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import CustomersManager, { AdminCustomer } from "@/components/admin/CustomersManager";

export default async function AdminCustomersPage() {
  await requirePage("customers");
  await connectToDatabase();
  const docs = await User.find({ role: { $ne: "admin" } })
    .select("name email provider coinBalance createdAt")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  const customers = JSON.parse(JSON.stringify(docs)) as AdminCustomer[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Customers</h1>
        <p className="mt-1 text-stone-600">Registered customers and their reward coins. You can add or remove coins (for example as a gift or a correction).</p>
      </div>
      <CustomersManager customers={customers} />
    </div>
  );
}
