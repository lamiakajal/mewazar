import React from "react";
import { requirePage } from "@/lib/admin-page";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import OrdersManager, { AdminOrder } from "@/components/admin/OrdersManager";
import { getSettings } from "@/lib/settings";

export default async function AdminOrdersPage() {
  await requirePage("orders");
  await connectToDatabase();
  const [docs, settings] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(200).lean(),
    getSettings(),
  ]);

  // Strip ObjectIds and Dates so the data can cross to the client component
  const orders = JSON.parse(JSON.stringify(docs)) as AdminOrder[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Orders</h1>
        <p className="mt-1 text-stone-600">
          Verify payments, move orders through each stage and add courier tracking. Customers are
          emailed automatically.
        </p>
      </div>
      <OrdersManager initialOrders={orders} couriers={settings.couriers} />
    </div>
  );
}
