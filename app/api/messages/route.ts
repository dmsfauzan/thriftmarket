import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    const list = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { store: { userId } }] },
      include: { buyer: { select: { name: true, image: true } }, store: { select: { storeName: true, logoUrl: true } }, messages: { take: 1, orderBy: { createdAt: "desc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(list);
  }

  const messages = await prisma.message.findMany({
    where: { conversationId, conversation: { OR: [{ buyerId: userId }, { store: { userId } }] } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  await prisma.message.updateMany({ where: { conversationId, senderId: { not: userId }, isRead: false }, data: { isRead: true } });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { conversationId, storeId, body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });

  let cid = conversationId;
  if (!cid && storeId) {
    const conv = await prisma.conversation.upsert({
      where: { buyerId_storeId: { buyerId: userId, storeId } },
      update: {},
      create: { buyerId: userId, storeId },
    });
    cid = conv.id;
  }

  if (!cid) return NextResponse.json({ error: "conversationId or storeId required" }, { status: 400 });

  const msg = await prisma.message.create({
    data: { conversationId: cid, senderId: userId, body: body.trim() },
    include: { conversation: { include: { buyer: true, store: true } } },
  });
  await prisma.conversation.update({ where: { id: cid }, data: { updatedAt: new Date() } });

  const recipientId = msg.conversation.buyerId === userId ? msg.conversation.store.userId : msg.conversation.buyerId;
  const senderName = msg.conversation.buyerId === userId ? msg.conversation.buyer.name : msg.conversation.store.storeName;

  const { notify } = await import("@/lib/notify");
  await notify({ userId: recipientId, type: "CHAT", title: `Pesan dari ${senderName}`, body: body.trim().slice(0, 50), link: `/chat?cid=${cid}` });

  return NextResponse.json(msg);
}
