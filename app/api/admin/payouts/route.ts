import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { notify } from "@/lib/notify";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const list = await prisma.withdrawal.findMany({ include: { wallet: { include: { user: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id, status, adminNote } = await req.json();
  const wdr = await prisma.withdrawal.findUnique({ where: { id }, include: { wallet: true } });
  if (!wdr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (status === "REJECTED" && wdr.status === "PENDING") {
    await prisma.$transaction([
      prisma.withdrawal.update({ where: { id }, data: { status: "REJECTED", adminNote } }),
      prisma.wallet.update({ where: { id: wdr.walletId }, data: { balance: { increment: wdr.amount } } }),
      prisma.ledger.create({ data: { walletId: wdr.walletId, amount: wdr.amount, type: "refund", description: `Penarikan ditolak: ${adminNote || "-"}` } }),
    ]);
    await notify({ userId: wdr.wallet.userId, type: "SYSTEM", title: "Penarikan ditolak", body: adminNote, link: "/seller/wallet" });
  } else if (status === "COMPLETED") {
    await prisma.withdrawal.update({ where: { id }, data: { status: "COMPLETED", adminNote } });
    await notify({ userId: wdr.wallet.userId, type: "SYSTEM", title: "Penarikan selesai", body: "Dana sudah ditransfer ke rekeningmu.", link: "/seller/wallet" });
  }

  return NextResponse.json({ ok: true });
}
