import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status");
  return NextResponse.json(
    await prisma.order.findMany({
      where: {
        ...(q ? { OR: [{ orderNumber: { contains: q } }, { buyer: { email: { contains: q } } }, { buyer: { name: { contains: q } } }] } : {}),
        ...(status && status !== "ALL" ? { status: status as never } : {}),
      },
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { buyer: true, store: true, items: { include: { product: { include: { images: true } } } } },
    })
  );
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id, status, waybillNumber } = await req.json();
  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status, ...(status === "SHIPPED" ? { shippedAt: new Date() } : {}), ...(status === "COMPLETED" ? { completedAt: new Date() } : {}), ...(status === "PAID" ? { paidAt: new Date() } : {}) } : {}),
      ...(waybillNumber !== undefined ? { waybillNumber } : {}),
    },
  });
  return NextResponse.json(order);
}
