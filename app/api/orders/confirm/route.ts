import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "SHIPPED") return NextResponse.json({ error: "Order belum dikirim" }, { status: 400 });

  await prisma.order.updateMany({ where: { id: orderId, status: "SHIPPED" }, data: { status: "COMPLETED", completedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
