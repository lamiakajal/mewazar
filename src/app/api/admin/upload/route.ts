import { NextResponse } from "next/server";
import { getStaffWith } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import ImageAsset from "@/models/ImageAsset";

const MAX_BYTES = 3 * 1024 * 1024; // the admin form shrinks photos to about 1200px first

/** Identifies the real file type from its first bytes (never trust the filename or MIME). */
function sniff(buf: Buffer): string | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  if (!(await getStaffWith(["products", "content"]))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image received" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (3 MB maximum)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = sniff(buffer);
  if (!contentType) {
    return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed" }, { status: 400 });
  }

  await connectToDatabase();
  const saved = await ImageAsset.create({ contentType, data: buffer, size: buffer.length });
  return NextResponse.json({ url: `/api/images/${saved._id.toString()}` }, { status: 201 });
}
