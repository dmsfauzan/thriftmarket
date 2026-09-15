import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { storeId } = await req.json();

  try {
    await prisma.follow.create({ data: { buyerId: userId, storeId } });
    return NextResponse.json({ ok: true, following: true });
  } catch {
    await prisma.follow.delete({ where: { buyerId_storeId: { buyerId: userId, storeId } } });
    return NextResponse.json({ ok: true, following: false });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ following: false });
  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  if (!storeId) return NextResponse.json([]);
  const f = await prisma.follow.findUnique({ where: { buyerId_storeId: { buyerId: userId, storeId } } });
  return NextResponse.json({ following: !!f });
}
