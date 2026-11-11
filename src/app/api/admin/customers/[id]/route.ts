import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getStaffWith } from "@/lib/admin";
import { logAction } from "@/lib/audit";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import CoinTransaction from "@/models/CoinTransaction";

type Ctx = { params: Promise<{ id: string }> };

/** Admin adds or removes reward coins for a customer (with a note for the history). */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await getStaffWith("customers"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const coins = Math.trunc(Number(body.coins));
  const note = String(body.note ?? "").trim().slice(0, 200) || "Adjusted by the shop";
  if (!Number.isFinite(coins) || coins === 0 || Math.abs(coins) > 100000) {
    return NextResponse.json({ error: "Enter a number of coins (not zero)" }, { status: 400 });
  }

  await connectToDatabase();
  // Removing coins never takes the balance below zero
  const filter = coins < 0 ? { _id: id, coinBalance: { $gte: -coins } } : { _id: id };
  const result = await User.updateOne(filter, { $inc: { coinBalance: coins } });
  if (result.modifiedCount !== 1) {
    return NextResponse.json({ error: "Customer not found or balance too low" }, { status: 400 });
  }

  await CoinTransaction.create({ userId: id, type: "adjust", coins, note });
  const user = await User.findById(id).select("coinBalance").lean<{ coinBalance?: number }>();
  await logAction("coins.adjust", `${user?.coinBalance ?? 0} coins after ${coins > 0 ? "+" : ""}${coins} (${note})`);
  return NextResponse.json({ balance: user?.coinBalance ?? 0 });
}
