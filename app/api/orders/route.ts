import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  if (!orderNumber) {
    const mine = await prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: { include: { product: { include: { images: true } } } }, store: true },
    });
    return NextResponse.json(mine);
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: { include: { images: true } } } }, store: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = order.buyerId === userId || order.store.userId === userId || role === "ADMIN";
  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(order);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status } =
    body as { order_id: string; status_code: string; gross_amount: string; signature_key: string; transaction_status: string };

  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const expected = crypto.createHash("sha512").update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest("hex");
  if (expected !== signature_key) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const statusMap: Record<string, "PAID" | "PENDING_PAYMENT" | "CANCELLED"> = {
    settlement: "PAID", capture: "PAID", pending: "PENDING_PAYMENT", expire: "CANCELLED", cancel: "CANCELLED", deny: "CANCELLED",
  };
  const mapped = statusMap[transaction_status];
  if (!mapped) return NextResponse.json({ ok: true });

  const order = await prisma.order.findUnique({ where: { orderNumber: order_id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const productIds = order.items.map((i) => i.productId);

  await prisma.$transaction(async (tx) => {
    if (mapped === "PAID") {
      await tx.order.update({ where: { orderNumber: order_id }, data: { status: "PAID", paidAt: new Date() } });
      await tx.product.updateMany({ where: { id: { in: productIds } }, data: { status: "SOLD" } });
      await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });
    } else if (mapped === "CANCELLED") {
      await tx.order.update({ where: { orderNumber: order_id }, data: { status: "CANCELLED" } });
      await tx.product.updateMany({ where: { id: { in: productIds }, status: "BOOKED" }, data: { status: "AVAILABLE" } });
    } else {
      await tx.order.update({ where: { orderNumber: order_id }, data: { status: "PENDING_PAYMENT" } });
    }
  });

  return NextResponse.json({ ok: true });
}
