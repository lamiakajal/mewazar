import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Order, { IOrder } from "@/models/Order";

const ORDER_STATUSES = ["placed", "processing", "dispatched", "delivered", "cancelled"];

export async function GET(req: Request) {
  if (!(await getAdminEmail())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const status = new URL(req.url).searchParams.get("status");
  const filter: { orderStatus?: IOrder["orderStatus"] } = {};
  if (status && ORDER_STATUSES.includes(status)) {
    filter.orderStatus = status as IOrder["orderStatus"];
  }

  await connectToDatabase();
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ orders });
}
