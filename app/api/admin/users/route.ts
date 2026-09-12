import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const users = await prisma.user.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { store: true, _count: { select: { orders: true, reviews: true } } },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id, role } = await req.json();
  if (!["BUYER", "SELLER", "ADMIN"].includes(role)) return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  const user = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const hasOrders = await prisma.order.findFirst({ where: { buyerId: id } });
  if (hasOrders) return NextResponse.json({ error: "Tidak bisa hapus: user masih memiliki pesanan" }, { status: 409 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.store.deleteMany({ where: { userId: id } });
      await tx.address.deleteMany({ where: { userId: id } });
      await tx.cartItem.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus user — masih ada data terkait" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
