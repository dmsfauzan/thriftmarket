import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as { id: string }).id;
  return NextResponse.json(await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }));
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id, readAll } = await req.json();
  if (readAll) {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  }
  return NextResponse.json({ ok: true });
}
