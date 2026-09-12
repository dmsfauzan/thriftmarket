import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status && ["PENDING", "APPROVED", "REJECTED"].includes(status) ? { sellerStatus: status as "PENDING" | "APPROVED" | "REJECTED" } : { role: "SELLER" as const };

  const sellers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, sellerStatus: true, sellerRejectReason: true, createdAt: true,
      store: { select: { id: true, storeName: true, description: true, approval: true, rejectReason: true, rating: true, _count: { select: { products: true } } } },
    },
  });
  return NextResponse.json(sellers);
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const { sellerId, action, reason } = (await req.json()) as { sellerId: string; action: "APPROVE" | "REJECT"; reason?: string };
  if (!sellerId || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }
  if (action === "REJECT" && !reason?.trim()) {
    return NextResponse.json({ error: "Alasan penolakan wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: sellerId }, include: { store: true } });
  if (!user || user.role !== "SELLER" || !user.store) {
    return NextResponse.json({ error: "Seller tidak ditemukan" }, { status: 404 });
  }

  const approved = action === "APPROVE";
  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: sellerId },
      data: {
        sellerStatus: approved ? "APPROVED" : "REJECTED",
        sellerRejectReason: approved ? null : reason!.trim(),
      },
    });
    const updatedStore = await tx.store.update({
      where: { id: user.store!.id },
      data: {
        approval: approved ? "APPROVED" : "REJECTED",
        rejectReason: approved ? null : reason!.trim(),
      },
    });
    return { user: updatedUser, store: updatedStore };
  });

  return NextResponse.json({ ok: true, ...result });
}
