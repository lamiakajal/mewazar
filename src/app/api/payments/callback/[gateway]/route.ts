import { NextResponse } from "next/server";
import { BRAND } from "@/data/brand";
import { getGateway } from "@/lib/payments/registry";
import { applyPaymentResult } from "@/lib/payments/apply";

type Ctx = { params: Promise<{ gateway: string }> };

/** The customer's browser returns here from the provider's payment page. */
async function handle(req: Request, { params }: Ctx) {
  const { gateway: id } = await params;
  const gateway = getGateway(id);
  const back = (query: string) => NextResponse.redirect(`${BRAND.siteUrl}/order-confirmed?${query}`, 303);

  if (!gateway || !gateway.isConfigured()) return back("status=error");

  try {
    const result = await gateway.parseCallback(req);
    await applyPaymentResult(gateway.id, result);
    return back(`order=${encodeURIComponent(result.orderNumber)}&status=${result.status}`);
  } catch (error) {
    console.error("Payment callback error:", error);
    return back("status=error");
  }
}

export const GET = handle;
export const POST = handle;
