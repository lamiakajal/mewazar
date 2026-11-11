import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import SettingsModel from "@/models/Settings";
import type { ArtKind, CategoryMeta } from "@/data/categories";

const ART: ArtKind[] = ["jar", "pouch", "bottle", "box", "tin"];
const COLOR = /^#[0-9a-fA-F]{6}$/;
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Saves the category list (names, colours, order). Categories that still have products cannot be removed. */
export async function PUT(req: Request) {
  if (!(await getStaffWith("categories"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const raw: Record<string, unknown>[] = Array.isArray(body?.categories) ? body.categories : [];
  if (raw.length === 0 || raw.length > 30) {
    return NextResponse.json({ error: "Keep between 1 and 30 categories" }, { status: 400 });
  }

  const categories: CategoryMeta[] = [];
  const slugs = new Set<string>();
  const names = new Set<string>();
  for (const c of raw) {
    const name = s(c.name, 40);
    const slug = s(c.slug, 40).toLowerCase();
    if (!name || !/^[a-z0-9-]{2,40}$/.test(slug)) {
      return NextResponse.json({ error: "Every category needs a name and a simple web address (letters, numbers, dashes)" }, { status: 400 });
    }
    if (slugs.has(slug) || names.has(name)) {
      return NextResponse.json({ error: `"${name}" is used twice` }, { status: 400 });
    }
    slugs.add(slug);
    names.add(name);

    const art = ART.includes(c.art as ArtKind) ? (c.art as ArtKind) : "pouch";
    const from = COLOR.test(String(c.from)) ? String(c.from) : "#E8C9A0";
    const to = COLOR.test(String(c.to)) ? String(c.to) : "#C99863";
    categories.push({
      slug,
      name,
      label: s(c.label, 40) || name,
      blurb: s(c.blurb, 160),
      art,
      from,
      to,
      ...(s(c.badge, 12) ? { badge: s(c.badge, 12) } : {}),
      ...(/^(\/|https:\/\/)/.test(s(c.image, 300)) ? { image: s(c.image, 300) } : {}),
    });
  }

  await connectToDatabase();
  const used: string[] = await ProductModel.distinct("category");
  const missing = used.filter((name) => !names.has(name));
  if (missing.length) {
    return NextResponse.json(
      { error: `You cannot remove "${missing[0]}" while products still use it. Move or delete those products first.` },
      { status: 400 },
    );
  }

  await SettingsModel.findOneAndUpdate({ key: "main" }, { $set: { "data.categories": categories } }, { upsert: true });
  await logAction("categories.update");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
