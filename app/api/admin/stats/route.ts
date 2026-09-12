import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const [userCount, productCount, orderCount, storeCount, reviewCount, revenue, recentOrders, productsByStatus, productsByApproval, ordersByStatus, lowStock, topProducts, topStores] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.store.count(),
    prisma.review.count(),
    prisma.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } }, _sum: { totalPrice: true } }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { buyer: true, store: true } }),
    prisma.product.groupBy({ by: ["status"], _count: true }),
    prisma.product.groupBy({ by: ["approval"], _count: true }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.product.findMany({ where: { status: "AVAILABLE" }, take: 5, orderBy: { createdAt: "asc" }, include: { store: true } }),
    prisma.product.findMany({ take: 5, orderBy: { updatedAt: "desc" }, include: { images: true, store: true, reviews: true } }),
    prisma.store.findMany({ take: 5, orderBy: { rating: "desc" }, include: { _count: { select: { products: true, orders: true } }, user: { select: { name: true, sellerStatus: true } } } }),
  ]);

  const trend: { label: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const agg = await prisma.order.aggregate({
      where: { createdAt: { gte: start, lt: end }, status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
      _count: true,
      _sum: { totalPrice: true },
    });
    trend.push({
      label: start.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      orders: agg._count,
      revenue: agg._sum.totalPrice ?? 0,
    });
  }

  return NextResponse.json({
    stats: { users: userCount, products: productCount, orders: orderCount, stores: storeCount, reviews: reviewCount, revenue: revenue._sum.totalPrice ?? 0 },
    recentOrders, statusBreakdown: productsByStatus, approvalBreakdown: productsByApproval, ordersByStatus, lowStock, topProducts, topStores, trend,
  });
}
