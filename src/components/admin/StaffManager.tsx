"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Trash2, UserPlus } from "lucide-react";
import { DEFAULT_MODERATOR_PERMISSIONS, PERMISSIONS, type PermissionKey } from "@/lib/permissions";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "moderator";
  permissions: PermissionKey[];
}

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

function PermissionBoxes({ value, onChange }: { value: PermissionKey[]; onChange: (v: PermissionKey[]) => void }) {
  const toggle = (key: PermissionKey) =>
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {PERMISSIONS.map((p) => (
        <label key={p.key} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-stone-200 p-3 text-sm">
          <input type="checkbox" checked={value.includes(p.key)} onChange={() => toggle(p.key)} className="mt-0.5 h-4 w-4 accent-primary" />
          <span>
            <span className="block font-bold text-stone-800">{p.label}</span>
            <span className="block text-xs text-stone-500">{p.desc}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function ModeratorCard({ member, onDone }: { member: StaffMember; onDone: () => void }) {
  const [permissions, setPermissions] = useState<PermissionKey[]>(member.permissions);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const call = async (method: "PATCH" | "DELETE") => {
    if (method === "DELETE" && !window.confirm(`Remove ${member.email} from the team?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/staff/${member._id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "PATCH" ? JSON.stringify({ permissions }) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update");
      setMessage("Saved");
      onDone();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update");
    } finally {
      setBusy(false);
    }
  };

  const changed = permissions.slice().sort().join() !== member.permissions.slice().sort().join();

  return (
    <article className="space-y-3 rounded-2xl border border-stone-200 bg-surface p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-stone-900">{member.name}</p>
          <p className="text-xs text-stone-500">{member.email}</p>
        </div>
        <button type="button" onClick={() => call("DELETE")} disabled={busy} aria-label={`Remove ${member.email}`} className="rounded-full p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <PermissionBoxes value={permissions} onChange={setPermissions} />
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => call("PATCH")} disabled={busy || !changed || permissions.length === 0} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 cursor-pointer">
          Save access
        </button>
        {message && <span className="text-xs font-semibold text-stone-600">{message}</span>}
      </div>
    </article>
  );
}

export default function StaffManager({ staff }: { staff: StaffMember[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<PermissionKey[]>(DEFAULT_MODERATOR_PERMISSIONS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const owners = staff.filter((s) => s.role === "admin");
  const moderators = staff.filter((s) => s.role === "moderator");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, permissions }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not add");
      setMessage({ text: `Added ${email}. Tell them to sign in with Google or GitHub using this email.`, ok: true });
      setEmail("");
      router.refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Could not add", ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-stone-900">
          <UserPlus className="h-5 w-5 text-gold-600" /> Add a moderator
        </h2>
        <form onSubmit={add} className="space-y-4">
          <label className="block text-xs font-bold text-stone-700">
            Their Google or GitHub email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mt-1.5`} placeholder="helper@gmail.com" />
          </label>
          <PermissionBoxes value={permissions} onChange={setPermissions} />
          <p className="text-xs text-stone-500">
            Moderators can never open Settings (payment accounts, coupons), Staff or Activity. Only you can.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy || permissions.length === 0} className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 cursor-pointer">
              {busy ? "Adding..." : "Add moderator"}
            </button>
            {message && <span role="status" className={`text-sm font-semibold ${message.ok ? "text-leaf-700" : "text-rose-600"}`}>{message.text}</span>}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-stone-900">Moderators ({moderators.length})</h2>
        {moderators.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-surface p-8 text-center text-sm text-stone-500">No moderators yet.</p>
        ) : (
          moderators.map((m) => <ModeratorCard key={m._id} member={m} onDone={() => router.refresh()} />)
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-stone-900">Owners</h2>
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-surface">
          {owners.map((o) => (
            <li key={o._id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <Crown className="h-4 w-4 text-gold-600" />
              <span className="font-bold text-stone-800">{o.name}</span>
              <span className="text-xs text-stone-500">{o.email}</span>
              <span className="ml-auto text-xs text-stone-400">set by ADMIN_EMAILS</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
