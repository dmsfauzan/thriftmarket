import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { ledgers: { orderBy: { createdAt: "desc" }, take: 50 }, withdrawals: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0 },
      include: { ledgers: true, withdrawals: true },
    });
  }

  return NextResponse.json(wallet);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { amount, reason } = await req.json();
  const amt = Number(amount);
  if (!amt || amt < 50000) return NextResponse.json({ error: "Minimal penarikan Rp50.000" }, { status: 400 });

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < amt) return NextResponse.json({ error: "Saldo tidak mencukupi" }, { status: 400 });

  try {
    const res = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amt } } });
      const wdr = await tx.withdrawal.create({ data: { walletId: wallet.id, amount: amt, reason: reason?.trim() || "Penarikan dana" } });
      await tx.ledger.create({ data: { walletId: wallet.id, amount: -amt, type: "payout", description: `Penarikan dana (Pending: ${wdr.id})` } });
      return wdr;
    });
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: "Gagal memproses penarikan" }, { status: 500 });
  }
}
