import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { notify } from "@/lib/notify";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  return NextResponse.json(await prisma.dispute.findMany({ include: { order: { include: { store: true } }, buyer: true }, orderBy: { createdAt: "desc" } }));
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id, status, resolution, refundAmount } = await req.json();
  if (!["RESOLVED_REFUND", "RESOLVED_REJECTED"].includes(status)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });

  const dispute = await prisma.dispute.update({
    where: { id },
    data: { status, resolution, refundAmount: status === "RESOLVED_REFUND" ? refundAmount : null },
    include: { order: { include: { store: true } } },
  });

  if (status === "RESOLVED_REFUND") {
    await prisma.order.update({ where: { id: dispute.orderId }, data: { status: "CANCELLED" } });
    const items = await prisma.orderItem.findMany({ where: { orderId: dispute.orderId } });
    await prisma.product.updateMany({ where: { id: { in: items.map((i) => i.productId) } }, data: { status: "AVAILABLE" } });
  }

  await notify({ userId: dispute.buyerId, type: "DISPUTE", title: `Komplain ${status === "RESOLVED_REFUND" ? "disetujui" : "ditolak"}`, body: resolution, link: `/orders/${dispute.order.orderNumber}` });
  await notify({ userId: dispute.order.store.userId, type: "DISPUTE", title: `Komplain ${dispute.order.orderNumber} ${status}`, body: resolution, link: "/seller/disputes" });
  await logActivity({ action: "DISPUTE_RESOLVED", actorId: (gate as any).session?.user?.id, actorName: (gate as any).session?.user?.name, actorRole: "ADMIN", message: `Admin menyelesaikan komplain ${dispute.order.orderNumber} → ${status}`, targetId: id });

  return NextResponse.json(dispute);
}
