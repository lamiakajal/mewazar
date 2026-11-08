import type { StoreSettings } from "@/lib/settings-types";
import { PAGE_DEFAULTS } from "@/lib/page-defaults";

export type ContentSections = Pick<StoreSettings, "brand" | "home" | "faq" | "pages">;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
  (Array.isArray(v) ? v : [])
    .map((x) => str(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);

/** Validates the Content page (brand, home page text, FAQ and page text). */
export function sanitizeContent(
  body: unknown,
): { ok: true; data: ContentSections } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid data" };
  const b = body as Record<string, Record<string, unknown>>;

  const name = str(b.brand?.name, 40);
  if (!name) return { ok: false, error: "The shop name cannot be empty" };

  const logoUrl = str(b.brand?.logoUrl, 300);
  if (logoUrl && !/^(\/api\/images\/[a-f0-9]{24}|https:\/\/)/.test(logoUrl)) {
    return { ok: false, error: "The logo must be an uploaded image or an https:// link" };
  }

  const heroTitle = str(b.home?.heroTitle, 140);
  if (!heroTitle) return { ok: false, error: "The home page headline cannot be empty" };

  const faq = (Array.isArray(b.faq) ? (b.faq as unknown as Record<string, unknown>[]) : [])
    .map((f) => ({ q: str(f?.q, 200), a: str(f?.a, 1200) }))
    .filter((f) => f.q && f.a)
    .slice(0, 25);

  // A page whose text equals the built-in text is stored as "" so it keeps following future defaults
  const pages = {} as ContentSections["pages"];
  for (const key of Object.keys(PAGE_DEFAULTS) as (keyof typeof PAGE_DEFAULTS)[]) {
    const text = str(b.pages?.[key], 12000);
    pages[key] = text === PAGE_DEFAULTS[key].body.trim() ? "" : text;
  }

  return {
    ok: true,
    data: {
      brand: { name, tagline: str(b.brand?.tagline, 80), logoUrl },
      home: {
        heroTitle,
        heroHighlight: str(b.home?.heroHighlight, 40),
        heroSubtitle: str(b.home?.heroSubtitle, 300),
        showSampleReviews: b.home?.showSampleReviews !== false,
        primaryButton: str(b.home?.primaryButton, 40) || "Shop now",
        secondaryButton: str(b.home?.secondaryButton, 40) || "Browse gift boxes",
        rotatingWords: list(b.home?.rotatingWords, 10, 40),
        marqueeWords: list(b.home?.marqueeWords, 14, 40),
        marqueeNotes: list(b.home?.marqueeNotes, 10, 60),
      },
      faq,
      pages,
    },
  };
}
