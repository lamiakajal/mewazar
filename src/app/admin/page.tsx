import React from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Coins, MessageSquare, ShoppingBag, Star } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/format";
import Order from "@/models/Order";
import ProductModel from "@/models/Product";
import { getSettings } from "@/lib/settings";
import { getStaff } from "@/lib/admin";
import { PERMISSIONS } from "@/lib/permissions";
import ReviewModel from "@/models/Review";
import ContactMessageModel from "@/models/ContactMessage";

const STATUS_STYLE: Record<string, string> = {
  placed: "bg-gold-100 text-gold-800",
  processing: "bg-brand-100 text-brand-800",
  dispatched: "bg-brand-100 text-brand-800",
  delivered: "bg-leaf-100 text-leaf-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const SECTION_LINKS: Record<string, string> = {
  orders: "/admin/orders",
  products: "/admin/products",
  reviews: "/admin/reviews",
  messages: "/admin/messages",
  customers: "/admin/customers",
  categories: "/admin/categories",
  content: "/admin/content",
};

export default async function AdminDashboard() {
  // Moderators get shortcuts to what they may do; revenue and settings stay with the owner
  const staff = await getStaff();
  if (staff && staff.role !== "admin") {
    const mine = PERMISSIONS.filter((p) => staff.permissions.includes(p.key));
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-heading">Welcome, {staff.name}</h1>
          <p className="mt-1 text-stone-600">You are a moderator. These are the areas the owner gave you.</p>
        </div>
        {mine.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-surface p-8 text-center text-stone-500">
            You do not have any permissions yet. Ask the owner to give you access.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {mine.map((p) => (
              <Link key={p.key} href={SECTION_LINKS[p.key]} className="rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft transition hover:border-gold-400">
                <p className="font-display text-lg font-bold text-stone-900">{p.label}</p>
                <p className="mt-1 text-sm text-stone-600">{p.desc}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  await connectToDatabase();
  const { inventory } = await getSettings();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [statusCounts, revenueAgg, todayCount, pendingPayments, recent, productCount, products, pendingReviews, unreadMessages] =
    await Promise.all([
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({
        paymentMethod: { $ne: "cod" },
        paymentStatus: "pending",
        orderStatus: { $ne: "cancelled" },
      }),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      ProductModel.estimatedDocumentCount(),
      ProductModel.find({ active: { $ne: false } }).lean(),
      ReviewModel.countDocuments({ status: "pending" }),
      ContactMessageModel.countDocuments({ read: false }),
    ]);

  const counts: Record<string, number> = {};
  for (const row of statusCounts) counts[row._id] = row.count;
  const totalOrders = Object.values(counts).reduce((a, b) => a + b, 0);
  const revenue = revenueAgg[0]?.total ?? 0;

  const lowStock = products
    .flatMap((p) =>
      p.variants
        .filter((v) => v.stock <= inventory.lowStockThreshold)
        .map((v) => ({ id: p.id, name: p.name, weight: v.weight, stock: v.stock })),
    )
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const cards = [
    { label: "Orders today", value: String(todayCount), icon: ShoppingBag },
    { label: "New orders to handle", value: String(counts.placed ?? 0), icon: Clock },
    { label: "Payments to verify", value: String(pendingPayments), icon: AlertTriangle },
    { label: "Revenue (excl. cancelled)", value: formatPrice(revenue), icon: Coins },
    { label: "Reviews to approve", value: String(pendingReviews), icon: Star, href: "/admin/reviews" },
    { label: "Unread messages", value: String(unreadMessages), icon: MessageSquare, href: "/admin/messages" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Dashboard</h1>
        <p className="mt-1 text-stone-600">
          {totalOrders} orders in total &middot; {productCount} products in the database
        </p>
      </div>

      {productCount === 0 && (
        <div className="rounded-2xl border border-gold-300 bg-gold-50 p-5 text-sm text-gold-900">
          Your product database is empty, so the store is showing the starter catalog.{" "}
          <Link href="/admin/products" className="font-bold underline">
            Import it in Products
          </Link>{" "}
          to start managing stock and prices.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => {
          const inner = (
            <>
              <Icon className="h-5 w-5 text-gold-600" />
              <p className="mt-3 font-display text-2xl font-extrabold text-stone-900">{value}</p>
              <p className="text-xs font-semibold text-stone-500">{label}</p>
            </>
          );
          const cls = "rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft";
          return href ? (
            <Link key={label} href={href} className={`${cls} transition hover:border-gold-400`}>
              {inner}
            </Link>
          ) : (
            <div key={label} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-stone-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-bold text-heading hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-stone-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recent.map((o) => (
                <li key={String(o._id)} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-800">{o.orderNumber}</p>
                    <p className="truncate text-xs text-stone-500">{o.shippingAddress.fullName}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[o.orderStatus]}`}>
                    {o.orderStatus}
                  </span>
                  <span className="text-sm font-extrabold text-stone-900">{formatPrice(o.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft">
          <h2 className="mb-3 font-display text-lg font-bold text-stone-900">Low stock ({inventory.lowStockThreshold} or fewer)</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-stone-500">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {lowStock.map((s) => (
                <li key={`${s.id}-${s.weight}`} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/admin/products/${s.id}`} className="min-w-0 truncate text-sm font-bold text-stone-800 hover:underline">
                    {s.name} <span className="font-medium text-stone-500">({s.weight})</span>
                  </Link>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      s.stock === 0 ? "bg-rose-100 text-rose-700" : "bg-gold-100 text-gold-800"
                    }`}
                  >
                    {s.stock === 0 ? "Out of stock" : `${s.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
