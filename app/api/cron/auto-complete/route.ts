import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stale = await prisma.order.findMany({
    where: { status: "SHIPPED", shippedAt: { lt: cutoff } },
    select: { id: true, buyerId: true, orderNumber: true },
    take: 100,
  });

  const result = await prisma.order.updateMany({
    where: { id: { in: stale.map((o) => o.id) }, status: "SHIPPED" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  const { releaseEscrow } = await import("@/lib/wallet");
  for (const o of stale) await releaseEscrow(o.id).catch(() => null);

  if (stale.length) {
    await prisma.notification.createMany({
      data: stale.map((o) => ({
        userId: o.buyerId,
        type: "ORDER" as const,
        title: "Pesanan selesai otomatis",
        body: `${o.orderNumber} COMPLETED setelah 1x24 jam SHIPPED.`,
        link: `/orders/${o.orderNumber}`,
      })),
      skipDuplicates: true,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, completed: result.count });
}
