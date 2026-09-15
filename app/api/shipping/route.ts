import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allQuotes } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "";
  const itemCount = Math.max(1, Number(searchParams.get("items") ?? 1) || 1);
  if (!city.trim()) return NextResponse.json({ error: "city required" }, { status: 400 });
  const setting = await prisma.siteSetting.findUnique({ where: { key: "shippingFee" } });
  const baseFee = Number(setting?.value ?? 15000) || 15000;
  return NextResponse.json(allQuotes({ city, itemCount, baseFee }));
}
