import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSeller } from "@/lib/seller";
import { logActivity } from "@/lib/activity";
import { notify } from "@/lib/notify";

export async function GET() {
  const gate = await requireApprovedSeller();
  if ("error" in gate) return gate.error;
  const { prisma } = await import("@/lib/prisma");
  const orders = await prisma.order.findMany({
    where: { storeId: gate.store.id },
    include: { items: { include: { product: { include: { images: true } } } }, buyer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  const gate = await requireApprovedSeller();
  if ("error" in gate) return gate.error;
  const { prisma } = await import("@/lib/prisma");
  const { orderId, waybillNumber } = await req.json();
  if (!waybillNumber?.trim()) return NextResponse.json({ error: "Nomor resi wajib diisi" }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.storeId !== gate.store.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "PAID") return NextResponse.json({ error: "Hanya pesanan PAID yang bisa dikirim" }, { status: 400 });
  await prisma.order.update({ where: { id: orderId }, data: { waybillNumber: waybillNumber.trim(), status: "SHIPPED", shippedAt: new Date() } });
  await notify({ userId: order.buyerId, type: "ORDER", title: `Pesanan dikirim: ${order.orderNumber}`, body: `Resi: ${waybillNumber.trim()} · Konfirmasi terima dalam 24 jam.`, link: `/orders/${order.orderNumber}` });
  await logActivity({
    action: "ORDER_SHIPPED",
    actorId: gate.userId,
    actorName: gate.user.name,
    actorRole: "SELLER",
    message: `${gate.user.name} mengirim ${order.orderNumber} — resi ${waybillNumber.trim()}`,
    targetId: orderId,
    metadata: { storeName: gate.store.storeName, orderNumber: order.orderNumber, waybill: waybillNumber.trim() },
  });
  return NextResponse.json({ ok: true });
}
