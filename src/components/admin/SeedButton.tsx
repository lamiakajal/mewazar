"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

/** Imports the starter catalog once, or ("photos") applies the starter photos and best-first order. */
export default function SeedButton({ mode = "import" }: { mode?: "import" | "photos" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const run = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setMessage(mode === "photos" ? `Updated ${data.updated} products.` : `Imported ${data.imported} products.`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-gold-ink transition hover:bg-gold-400 disabled:opacity-60 cursor-pointer"
      >
        <Download className="h-4 w-4" />
        {busy ? "Working..." : mode === "photos" ? "Apply starter photos" : "Import starter catalog"}
      </button>
      {message && <span className="text-sm font-semibold text-stone-600">{message}</span>}
    </div>
  );
}
