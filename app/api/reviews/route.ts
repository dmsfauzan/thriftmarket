import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { recalcStoreRating } from "@/lib/store-rating";

const reviewSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(2000),
  imageUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { orderId, productId, rating, comment, imageUrl } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, store: true } });
  if (!order || order.buyerId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "COMPLETED") return NextResponse.json({ error: "Ulasan hanya untuk pesanan yang selesai" }, { status: 400 });
  if (!order.items.some((i) => i.productId === productId)) return NextResponse.json({ error: "Produk tidak termasuk dalam pesanan" }, { status: 400 });

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) return NextResponse.json({ error: "Pesanan ini sudah diulas" }, { status: 409 });

  try {
    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({ data: { orderId, userId, productId, rating, comment, imageUrl } });
      return r;
    });
    await recalcStoreRating(order.storeId).catch(() => null);
    await notify({ userId: order.store.userId, type: "SYSTEM", title: `Ulasan baru: ${rating}★`, body: comment.slice(0, 80), link: "/seller/reviews" });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Pesanan ini sudah diulas" }, { status: 409 });
  }
}
