import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as { id: string }).id;
  return NextResponse.json(await prisma.wishlistItem.findMany({ where: { userId }, include: { product: { include: { images: true, store: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  try {
    await prisma.wishlistItem.create({ data: { userId, productId } });
    return NextResponse.json({ ok: true });
  } catch {
    await prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } });
    return NextResponse.json({ ok: false, removed: true });
  }
}
