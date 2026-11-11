"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  History,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import type { PermissionKey } from "@/lib/permissions";

interface NavAccess {
  email: string;
  name: string;
  role: "admin" | "moderator";
  permissions: PermissionKey[];
}

// "owner" items are only for the shop owner (admin)
const LINKS: { href: string; label: string; icon: typeof Package; needs?: PermissionKey | "owner" }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, needs: "orders" },
  { href: "/admin/products", label: "Products", icon: Package, needs: "products" },
  { href: "/admin/categories", label: "Categories", icon: Tags, needs: "categories" },
  { href: "/admin/customers", label: "Customers", icon: Users, needs: "customers" },
  { href: "/admin/reviews", label: "Reviews", icon: Star, needs: "reviews" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, needs: "messages" },
  { href: "/admin/content", label: "Content", icon: FileText, needs: "content" },
  { href: "/admin/settings", label: "Settings", icon: Settings, needs: "owner" },
  { href: "/admin/staff", label: "Staff", icon: UserCog, needs: "owner" },
  { href: "/admin/activity", label: "Activity", icon: History, needs: "owner" },
];

export default function AdminNav({ access }: { access: NavAccess }) {
  const pathname = usePathname();
  const isOwner = access.role === "admin";

  const visible = LINKS.filter((l) => {
    if (!l.needs) return true;
    if (isOwner) return true;
    return l.needs !== "owner" && access.permissions.includes(l.needs);
  });

  return (
    <aside className="site-chrome lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-2xl border border-stone-200 bg-surface p-3 shadow-soft">
        <p className="px-3 pb-1 pt-1 text-xs font-bold text-stone-500">{isOwner ? "Owner" : "Moderator"}</p>
        <p className="truncate px-3 pb-3 text-sm font-bold text-stone-800">{access.email}</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
          {visible.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  active ? "bg-primary text-white" : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-500 transition hover:bg-stone-100"
          >
            <Store className="h-4 w-4" />
            View store
          </Link>
        </nav>
      </div>
    </aside>
  );
}
