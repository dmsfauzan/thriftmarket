import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSeller() {
  const session = await auth();
  const userId = (session?.user as { id: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  if (role !== "SELLER") return { error: NextResponse.json({ error: "Hanya SELLER" }, { status: 403 }) } as const;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { store: true } });
  if (!user?.store) return { error: NextResponse.json({ error: "Store belum dibuat" }, { status: 400 }) } as const;
  return { session, userId, user, store: user.store };
}

export async function requireApprovedSeller() {
  const base = await requireSeller();
  if ("error" in base) return base;
  if (base.user.sellerStatus !== "APPROVED" || base.store.approval !== "APPROVED") {
    return {
      error: NextResponse.json(
        { error: "Akun/toko menunggu persetujuan admin", sellerStatus: base.user.sellerStatus, storeApproval: base.store.approval },
        { status: 403 }
      ),
    } as const;
  }
  return base;
}
