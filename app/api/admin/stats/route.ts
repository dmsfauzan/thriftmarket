import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const [userCount, productCount, orderCount, storeCount, reviewCount, revenue, recentOrders, productsByStatus, lowStock, topProducts] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.store.count(),
    prisma.review.count(),
    prisma.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } }, _sum: { totalPrice: true } }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { buyer: true, store: true } }),
    prisma.product.groupBy({ by: ["status"], _count: true }),
    prisma.product.findMany({ where: { status: "AVAILABLE" }, take: 5, orderBy: { createdAt: "asc" }, include: { store: true } }),
    prisma.product.findMany({ take: 5, orderBy: { updatedAt: "desc" }, include: { images: true, store: true, reviews: true } }),
  ]);

  return NextResponse.json({
    stats: { users: userCount, products: productCount, orders: orderCount, stores: storeCount, reviews: reviewCount, revenue: revenue._sum.totalPrice ?? 0 },
    recentOrders, statusBreakdown: productsByStatus, lowStock, topProducts,
  });
}
