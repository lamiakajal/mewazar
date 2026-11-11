import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import { getSettings } from "@/lib/settings";
import { sanitizeSettings } from "@/lib/settings-input";
import SettingsModel from "@/models/Settings";

export async function GET() {
  if (!(await getStaffWith("owner"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(req: Request) {
  if (!(await getStaffWith("owner"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const parsed = sanitizeSettings(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // qrCodeUrl is generated from the account number when settings are read
  const data = {
    ...parsed.data,
    payments: parsed.data.payments.map((p) => ({ ...p, qrCodeUrl: undefined })),
  };

  await connectToDatabase();
  // Only the sections of this page are replaced; categories, brand and page text are kept
  const $set = Object.fromEntries(Object.entries(data).map(([k, v]) => [`data.${k}`, v]));
  await SettingsModel.findOneAndUpdate({ key: "main" }, { $set }, { upsert: true });
  await logAction("settings.update");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
