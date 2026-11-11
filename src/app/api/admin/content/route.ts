import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { sanitizeContent } from "@/lib/content-input";
import SettingsModel from "@/models/Settings";

export async function PUT(req: Request) {
  if (!(await getStaffWith("content"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const parsed = sanitizeContent(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await connectToDatabase();
  const $set = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [`data.${k}`, v]));
  await SettingsModel.findOneAndUpdate({ key: "main" }, { $set }, { upsert: true });
  await logAction("content.update");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
