"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { PAGE_DEFAULTS } from "@/lib/page-defaults";
import type { PageKey, StoreSettings } from "@/lib/settings-types";

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40";

type Sections = Pick<StoreSettings, "brand" | "home" | "faq" | "pages">;

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-surface p-5 shadow-soft">
      <div>
        <h2 className="font-display text-lg font-bold text-stone-900">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-stone-500">{hint}</span>}
    </label>
  );
}

const lines = (v: string[]) => v.join("\n");
const toList = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

const PAGE_LABELS: Record<PageKey, string> = {
  about: "About us",
  delivery: "Delivery policy",
  returns: "Return policy",
  privacy: "Privacy policy",
  terms: "Terms and conditions",
};

/** Shop name, logo, home page text, FAQ and the text of every content page. */
export default function ContentEditor({ initial }: { initial: Sections }) {
  const router = useRouter();
  const [s, setS] = useState<Sections>(initial);
  // Textareas for lists keep their own text so typing a new line feels natural
  const [rotating, setRotating] = useState(lines(initial.home.rotatingWords));
  const [marqueeWords, setMarqueeWords] = useState(lines(initial.home.marqueeWords));
  const [marqueeNotes, setMarqueeNotes] = useState(lines(initial.home.marqueeNotes));
  const [openPage, setOpenPage] = useState<PageKey>("about");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patchBrand = (p: Partial<Sections["brand"]>) => setS((prev) => ({ ...prev, brand: { ...prev.brand, ...p } }));
  const patchHome = (p: Partial<Sections["home"]>) => setS((prev) => ({ ...prev, home: { ...prev.home, ...p } }));

  const uploadLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      patchBrand({ logoUrl: data.url });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Upload failed", ok: false });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: Sections = {
        ...s,
        home: { ...s.home, rotatingWords: toList(rotating), marqueeWords: toList(marqueeWords), marqueeNotes: toList(marqueeNotes) },
      };
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save");
      setMessage({ text: "Saved. Your store is updated.", ok: true });
      router.refresh();
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Could not save", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Shop name and logo" hint="Shown in the header, footer, loading screen, emails and browser tab.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shop name">
            <input value={s.brand.name} onChange={(e) => patchBrand({ name: e.target.value })} className={inputClass} maxLength={40} />
          </Field>
          <Field label="Tagline">
            <input value={s.brand.tagline} onChange={(e) => patchBrand({ tagline: e.target.value })} className={inputClass} maxLength={80} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-xl border border-stone-200 bg-stone-50">
            <LogoMark className="h-12 w-12" logoUrl={s.brand.logoUrl} />
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => uploadLogo(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60 cursor-pointer">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload your logo"}
          </button>
          {s.brand.logoUrl && (
            <button type="button" onClick={() => patchBrand({ logoUrl: "" })} className="text-xs font-bold text-stone-500 underline cursor-pointer">
              Use the built-in logo
            </button>
          )}
          <p className="text-xs text-stone-500">A square PNG with a transparent background works best.</p>
        </div>
      </Card>

      <Card title="Home page" hint="The big text at the top of your home page and the scrolling band.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Headline">
              <input value={s.home.heroTitle} onChange={(e) => patchHome({ heroTitle: e.target.value })} className={inputClass} maxLength={140} />
            </Field>
          </div>
          <Field label="Word to highlight in the headline" hint="Must appear in the headline. It gets a moving colour.">
            <input value={s.home.heroHighlight} onChange={(e) => patchHome({ heroHighlight: e.target.value })} className={inputClass} maxLength={40} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Main button">
              <input value={s.home.primaryButton} onChange={(e) => patchHome({ primaryButton: e.target.value })} className={inputClass} maxLength={40} />
            </Field>
            <Field label="Second button">
              <input value={s.home.secondaryButton} onChange={(e) => patchHome({ secondaryButton: e.target.value })} className={inputClass} maxLength={40} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Text under the headline">
              <textarea rows={3} value={s.home.heroSubtitle} onChange={(e) => patchHome({ heroSubtitle: e.target.value })} className={inputClass} maxLength={300} />
            </Field>
          </div>
          <Field label="Changing words in the small badge (one per line)">
            <textarea rows={5} value={rotating} onChange={(e) => setRotating(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Big scrolling words (one per line)">
            <textarea rows={5} value={marqueeWords} onChange={(e) => setMarqueeWords(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Small scrolling notes (one per line)" hint="The free-delivery note is added automatically.">
              <textarea rows={4} value={marqueeNotes} onChange={(e) => setMarqueeNotes(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Testimonials" hint="The customer reviews carousel on your home page.">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-stone-700">
          <input type="checkbox" checked={s.home.showSampleReviews} onChange={(e) => patchHome({ showSampleReviews: e.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />
          <span>
            Show sample testimonials until I have enough real reviews
            <span className="mt-1 block text-xs font-normal text-gold-800">
              These are invented examples for design preview. Switch this OFF before the real launch, so customers only see genuine reviews (approve them in Reviews).
            </span>
          </span>
        </label>
      </Card>

      <Card title="Questions and answers (FAQ)">
        <div className="space-y-3">
          {s.faq.map((f, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-[1fr_2fr_auto]">
              <input value={f.q} onChange={(e) => setS((p) => ({ ...p, faq: p.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) }))} className={inputClass} placeholder="Question" maxLength={200} />
              <textarea rows={2} value={f.a} onChange={(e) => setS((p) => ({ ...p, faq: p.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) }))} className={inputClass} placeholder="Answer" maxLength={1200} />
              <button type="button" onClick={() => setS((p) => ({ ...p, faq: p.faq.filter((_, j) => j !== i) }))} aria-label="Remove question" className="self-start rounded-lg p-2.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setS((p) => ({ ...p, faq: [...p.faq, { q: "", a: "" }] }))} className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:border-gold-500 cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Add question
          </button>
        </div>
      </Card>

      <Card title="Page text" hint="Edit the text of your About page and policies. No coding needed.">
        <div className="rounded-xl bg-gold-50 p-4 text-xs leading-relaxed text-gold-900">
          <p className="font-bold">How to write</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li><code>## Heading</code> makes a heading, <code>- text</code> makes a bullet point.</li>
            <li><code>**bold**</code> makes bold text, <code>[link text](https://example.com)</code> makes a link.</li>
            <li>Leave an empty line between paragraphs.</li>
            <li>
              Automatic values that follow your Settings: <code>{"{{shopName}}"}</code> <code>{"{{freeThreshold}}"}</code> <code>{"{{shippingFee}}"}</code>{" "}
              <code>{"{{deliveryDays}}"}</code> <code>{"{{returnDays}}"}</code> <code>{"{{supportEmail}}"}</code> <code>{"{{phone}}"}</code> <code>{"{{whatsappUrl}}"}</code>{" "}
              <code>{"{{couriers}}"}</code> <code>{"{{country}}"}</code>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist">
          {(Object.keys(PAGE_LABELS) as PageKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={openPage === key}
              onClick={() => setOpenPage(key)}
              className={`rounded-full border px-4 py-2 text-xs font-bold cursor-pointer ${openPage === key ? "border-primary bg-primary text-white" : "border-stone-200 bg-surface text-stone-700 hover:border-gold-500"}`}
            >
              {PAGE_LABELS[key]}
            </button>
          ))}
        </div>

        <textarea
          rows={16}
          value={s.pages[openPage]}
          onChange={(e) => setS((p) => ({ ...p, pages: { ...p.pages, [openPage]: e.target.value } }))}
          className={`${inputClass} font-mono text-[13px] leading-relaxed`}
          aria-label={`${PAGE_LABELS[openPage]} text`}
        />
        <button
          type="button"
          onClick={() => setS((p) => ({ ...p, pages: { ...p.pages, [openPage]: PAGE_DEFAULTS[openPage].body } }))}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 underline cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Put back the original text for this page
        </button>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-surface/95 p-4 shadow-lift backdrop-blur">
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60 cursor-pointer">
          {saving ? "Saving..." : "Save content"}
        </button>
        {message && (
          <p role="status" className={`text-sm font-semibold ${message.ok ? "text-leaf-700" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
