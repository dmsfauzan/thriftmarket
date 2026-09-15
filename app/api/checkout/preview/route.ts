import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const parsed = (await import("@/lib/validators")).checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const address = await prisma.address.findFirst({ where: { id: parsed.data.addressId, userId } });
  if (!address) return NextResponse.json({ error: "Alamat tidak valid" }, { status: 400 });

  const { allQuotes, quoteShipping } = await import("@/lib/shipping");
  const setting = await prisma.siteSetting.findUnique({ where: { key: "shippingFee" } });
  const baseFee = Number(setting?.value ?? 15000) || 15000;

  const products = await prisma.product.findMany({ where: { id: { in: parsed.data.productIds } }, select: { storeId: true, weight: true } });
  const byStore = new Map<string, number>();
  for (const p of products) {
    byStore.set(p.storeId, (byStore.get(p.storeId) ?? 0) + (p.weight ?? 600));
  }
  const storeCount = byStore.size || 1;
  const quotes = allQuotes({ city: address.city, itemCount: parsed.data.productIds.length, totalWeightGram: products.reduce((a, p) => a + (p.weight ?? 600), 0), baseFee });
  const perStore = quotes.map((q) => ({ ...q, fee: [...byStore.values()].reduce((acc, w) => acc + quoteShipping({ city: address.city, courier: q.courier, itemCount: 1, totalWeightGram: w, baseFee }).fee, 0) }));
  let promo: { code: string; discount: number } | null = null;
  if (parsed.data.promoCode) {
    const found = await prisma.promo.findUnique({ where: { code: parsed.data.promoCode } });
    if (found && found.isActive && (!found.expiresAt || found.expiresAt.getTime() >= Date.now())) {
      promo = { code: found.code, discount: found.discount };
    }
  }
  return NextResponse.json({ quotes: perStore, promo, storeCount });
}
