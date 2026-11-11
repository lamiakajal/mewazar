import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import type { GatewayResult } from "@/lib/payments/types";

export type ApplyOutcome = "updated" | "ignored" | "unknown-order";

/**
 * Applies a verified payment result to an order. Safe to call many times (providers
 * often notify twice): a payment that is already verified or refunded is left alone.
 */
export async function applyPaymentResult(gatewayId: string, result: GatewayResult): Promise<ApplyOutcome> {
  await connectToDatabase();
  const order = await Order.findOne({ orderNumber: result.orderNumber });
  if (!order) return "unknown-order";
  if (order.paymentStatus === "verified" || order.paymentStatus === "refunded") return "ignored";
  if (result.status === "pending") return "ignored";

  // Never trust a "paid" message whose amount does not match the order
  if (result.status === "paid" && result.amount !== undefined && Math.round(result.amount) !== Math.round(order.totalAmount)) {
    order.adminNote = `${order.adminNote ? order.adminNote + " | " : ""}${gatewayId} reported Rs. ${result.amount} but the order total is Rs. ${order.totalAmount}. Check manually.`.slice(0, 500);
    await order.save();
    return "ignored";
  }

  order.paymentStatus = result.status === "paid" ? "verified" : "failed";
  order.paymentGateway = gatewayId;
  if (result.providerRef) order.gatewayRef = result.providerRef;
  await order.save();
  return "updated";
}
