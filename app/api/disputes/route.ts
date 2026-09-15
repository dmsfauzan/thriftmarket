import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const disputes = await prisma.dispute.findMany({
    where: {
      ...(role === "ADMIN" ? {} : { OR: [{ buyerId: userId }, { order: { store: { userId } } }] }),
      ...(status ? { status: status as never } : {}),
    },
    include: { order: { include: { store: true } }, buyer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(disputes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { orderId, reason, evidenceUrl } = await req.json();
  if (!reason?.trim() || reason.trim().length < 10) return NextResponse.json({ error: "Alasan minimal 10 karakter" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { store: true } });
  if (!order || order.buyerId !== userId) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  if (order.status !== "PAID" && order.status !== "SHIPPED") return NextResponse.json({ error: "Order tidak bisa dikomplain di status ini" }, { status: 400 });

  try {
    const dispute = await prisma.dispute.create({
      data: { orderId, buyerId: userId, reason: reason.trim(), evidenceUrl },
    });
    await logActivity({ action: "DISPUTE_OPENED", actorId: userId, actorName: session.user.name, actorRole: "BUYER", message: `Buyer mengajukan komplain untuk ${order.orderNumber}`, targetId: dispute.id });
    await notify({ userId: order.store.userId, type: "DISPUTE", title: "Komplain masuk", body: `Buyer komplain pesanan ${order.orderNumber}. Segera respon.`, link: "/seller/disputes" });
    return NextResponse.json(dispute);
  } catch {
    return NextResponse.json({ error: "Komplain untuk order ini sudah ada" }, { status: 409 });
  }
}
