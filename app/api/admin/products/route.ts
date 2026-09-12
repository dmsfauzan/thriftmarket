import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const approval = searchParams.get("approval");
  const products = await prisma.product.findMany({
    where: {
      ...(q ? { title: { contains: q } } : {}),
      ...(approval && ["PENDING", "APPROVED", "REJECTED"].includes(approval) ? { approval: approval as "PENDING" | "APPROVED" | "REJECTED" } : {}),
    },
    take: 100,
    orderBy: { updatedAt: "desc" },
    include: { images: true, store: true, category: true, reviews: true },
  });
  return NextResponse.json(products);
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { productId, action, note } = (await req.json()) as { productId: string; action: "APPROVE" | "REJECT"; note?: string };
  if (!productId || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }
  if (action === "REJECT" && !note?.trim()) {
    return NextResponse.json({ error: "Catatan penolakan wajib diisi" }, { status: 400 });
  }
  const approved = action === "APPROVE";
  const product = await prisma.product.update({
    where: { id: productId },
    data: { approval: approved ? "APPROVED" : "REJECTED", approvalNote: approved ? null : note!.trim() },
    include: { images: true },
  });
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const hasOrderItem = await prisma.orderItem.findFirst({ where: { productId: id } });
  if (hasOrderItem) return NextResponse.json({ error: "Tidak bisa hapus: produk sudah ada di pesanan" }, { status: 409 });

  await prisma.$transaction([
    prisma.review.deleteMany({ where: { productId: id } }),
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.productImage.deleteMany({ where: { productId: id } }),
  ]);
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
