import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ShieldAlert } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getStaff } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin pages are always rendered fresh for the signed-in admin
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const staff = await getStaff();
  if (!staff) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldAlert className="mx-auto h-14 w-14 text-rose-500" />
        <h1 className="mt-4 font-display text-3xl font-extrabold text-stone-900">Staff access only</h1>
        <p className="mt-2 text-stone-600">
          This account is not part of the shop team. The owner can add you under Admin &gt; Staff. Sign in
          with Google or GitHub (not with a password) using the email the owner added.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
          Back to the store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <AdminNav access={staff} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
