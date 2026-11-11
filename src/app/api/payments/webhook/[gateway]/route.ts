import { NextResponse } from "next/server";
import { getGateway } from "@/lib/payments/registry";
import { applyPaymentResult } from "@/lib/payments/apply";

type Ctx = { params: Promise<{ gateway: string }> };

/** Server-to-server payment notification (works even if the customer closes the browser). */
export async function POST(req: Request, { params }: Ctx) {
  const { gateway: id } = await params;
  const gateway = getGateway(id);
  if (!gateway || !gateway.isConfigured()) {
    return NextResponse.json({ error: "Unknown payment gateway" }, { status: 404 });
  }

  try {
    const result = await gateway.parseCallback(req);
    const outcome = await applyPaymentResult(gateway.id, result);
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    // An invalid signature or malformed body ends up here
    console.error("Payment webhook rejected:", error);
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }
}
