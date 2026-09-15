import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const reviews = await prisma.review.findMany({
    where: q ? { OR: [{ comment: { contains: q } }, { product: { title: { contains: q } } }, { product: { store: { storeName: { contains: q } } } }] } : undefined,
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true, store: { select: { storeName: true } } } }, user: { select: { name: true, email: true } }, order: { select: { orderNumber: true } } },
  });
  return NextResponse.json(reviews);
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id, hidden } = (await req.json()) as { id: string; hidden: boolean };
  const review = await prisma.review.update({ where: { id }, data: { isHidden: hidden }, include: { product: { select: { title: true } } } });
  const admin = (gate as { session: { user?: { id?: string; name?: string } } }).session;
  await logActivity({
    action: hidden ? "PRODUCT_REJECTED" : "PRODUCT_APPROVED",
    actorId: admin.user?.id ?? null, actorName: admin.user?.name ?? "Admin", actorRole: "ADMIN",
    message: hidden ? `Admin menyembunyikan ulasan "${review.product.title}"` : `Admin menampilkan kembali ulasan "${review.product.title}"`,
    targetId: id, metadata: { title: review.product.title, hidden },
  });
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const review = await prisma.review.findUnique({ where: { id }, include: { product: true } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.review.delete({ where: { id } });
  const productId = review.productId;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) {
    const { recalcStoreRating } = await import("@/lib/store-rating");
    await recalcStoreRating(product.storeId);
  }
  return NextResponse.json({ ok: true });
}
