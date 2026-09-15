import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`cart:${req.headers.get("x-forwarded-for") ?? "anon"}`, 40);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { productId } = await req.json();
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { store: true } });

  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  if (product.status !== "AVAILABLE" || product.approval !== "APPROVED") return NextResponse.json({ error: "Produk belum disetujui admin atau sudah tidak tersedia" }, { status: 400 });
  if (product.store.userId === userId) return NextResponse.json({ error: "Tidak bisa menambah produk sendiri ke keranjang" }, { status: 400 });

  try {
    await prisma.cartItem.create({ data: { userId, productId } });
  } catch {
    return NextResponse.json({ error: "Produk sudah ada di keranjang" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as { id: string }).id;

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: true, store: true } } },
    orderBy: { createdAt: "desc" },
  });

  const available = items.filter((i) => i.product.status === "AVAILABLE" && i.product.approval === "APPROVED");
  if (available.length !== items.length) {
    const expired = items.filter((i) => i.product.status !== "AVAILABLE" || i.product.approval !== "APPROVED").map((i) => i.productId);
    await prisma.cartItem.deleteMany({ where: { userId, productId: { in: expired } } });
    return NextResponse.json(available);
  }

  return NextResponse.json(items);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await prisma.cartItem.delete({ where: { userId_productId: { userId, productId } } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
