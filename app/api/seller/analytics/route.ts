import { NextResponse } from "next/server";
import { requireApprovedSeller } from "@/lib/seller";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const gate = await requireApprovedSeller();
  if ("error" in gate) return gate.error;

  const storeId = gate.store.id;
  const setting = await prisma.siteSetting.findUnique({ where: { key: "feePercent" } });
  const feePercent = Number(setting?.value ?? 0) || 0;
  const [orders, products, reviews, gross, ledgers] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], where: { storeId }, _count: true }),
    prisma.product.count({ where: { storeId } }),
    prisma.review.aggregate({ where: { product: { storeId } }, _avg: { rating: true }, _count: true }),
    prisma.order.aggregate({ where: { storeId, status: { in: ["PAID", "SHIPPED", "COMPLETED"] } }, _sum: { totalPrice: true, shippingFee: true, discountAmount: true } }),
    prisma.ledger.findMany({ where: { wallet: { userId: gate.userId } }, select: { amount: true, createdAt: true } }),
  ]);
  const grossVal = gross._sum.totalPrice ?? 0;
  const fee = Math.round((grossVal - (gross._sum.shippingFee ?? 0)) * (feePercent / 100));
  const net = grossVal - fee;
  const refundRate = grossVal ? 0 : 0;

  const trend: { label: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const agg = await prisma.order.aggregate({
      where: { storeId, createdAt: { gte: start, lt: end }, status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
      _count: true,
      _sum: { totalPrice: true },
    });
    trend.push({ label: start.toLocaleDateString("id-ID", { weekday: "short" }), orders: agg._count, revenue: agg._sum.totalPrice ?? 0 });
  }

  return NextResponse.json({
    products,
    rating: reviews._avg.rating ?? 0,
    reviewCount: reviews._count,
    revenue: grossVal,
    net,
    fee,
    feePercent,
    orders,
    trend,
    ledgerCount: ledgers.length,
    refundRate,
  });
}
