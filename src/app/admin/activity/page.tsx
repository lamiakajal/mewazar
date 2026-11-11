import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { requirePage } from "@/lib/admin-page";
import AuditLogModel from "@/models/AuditLog";

interface Row {
  _id: string;
  actorEmail: string;
  actorName: string;
  actorRole: "admin" | "moderator";
  action: string;
  detail: string;
  createdAt: string;
}

export default async function AdminActivityPage() {
  await requirePage("owner");
  await connectToDatabase();
  const docs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(200).lean();
  const rows = JSON.parse(JSON.stringify(docs)) as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-heading">Activity</h1>
        <p className="mt-1 text-stone-600">The last 200 changes made in the admin panel, and who made them.</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-surface p-10 text-center text-stone-500">No activity yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-surface shadow-soft">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs font-bold text-stone-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">What</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((r) => (
                <tr key={r._id} className="align-top">
                  <td className="px-4 py-3 text-xs text-stone-500" suppressHydrationWarning>
                    {new Date(r.createdAt).toLocaleString("en-PK")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-stone-800">{r.actorName || r.actorEmail}</p>
                    <p className="text-xs text-stone-500">{r.actorRole === "admin" ? "Owner" : "Moderator"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-bold text-gold-800">{r.action}</span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
