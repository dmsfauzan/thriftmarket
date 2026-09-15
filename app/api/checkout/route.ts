import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { quoteShipping } from "@/lib/shipping";
import { notify } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(`checkout:${req.headers.get("x-forwarded-for") ?? "anon"}`, 10);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu sering checkout — coba lagi sebentar" }, { status: 429 });
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const buyerId = (session.user as { id: string }).id;

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const productIds = [...new Set(parsed.data.productIds)];
  const { addressId, courier, promoCode } = parsed.data;

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: buyerId } });
  if (!address) return NextResponse.json({ error: "Alamat tidak valid" }, { status: 400 });

  let promo: { code: string; discount: number } | null = null;
  if (promoCode) {
    const found = await prisma.promo.findUnique({ where: { code: promoCode } });
    if (!found || !found.isActive) return NextResponse.json({ error: "Kode promo tidak valid" }, { status: 400 });
    if (found.expiresAt && found.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Kode promo sudah kedaluwarsa" }, { status: 400 });
    if (found.maxUses !== null && found.usageCount >= found.maxUses) return NextResponse.json({ error: "Kuota kode promo habis" }, { status: 400 });
    promo = { code: found.code, discount: found.discount };
  }

  const setting = await prisma.siteSetting.findUnique({ where: { key: "shippingFee" } });
  const baseFee = Number(setting?.value ?? 15000) || 15000;

  let locked: {
    paymentGroup: string;
    orderNumber: string;
    total: number;
    discountAmount: number;
    shippingFee: number;
    items: { id: string; price: number; name: string }[];
    orders: { id: string; orderNumber: string; storeId: string; sellerId: string }[];
  };

  try {
    locked = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: productIds } }, include: { store: true } });
      if (products.length !== productIds.length) throw new Error("Beberapa produk sudah tidak tersedia");
      if (products.some((p) => p.status !== "AVAILABLE" || p.approval !== "APPROVED")) throw new Error("Beberapa produk belum disetujui admin atau sudah tidak tersedia");
      if (products.some((p) => p.store.userId === buyerId)) throw new Error("Tidak bisa membeli produk dari tokomu sendiri");

      const byStore = new Map<string, typeof products>();
      for (const p of products) {
        const list = byStore.get(p.storeId) ?? [];
        list.push(p);
        byStore.set(p.storeId, list);
      }

      const subtotal = products.reduce((acc, p) => acc + p.price, 0);
      const discountAmount = promo ? Math.round((subtotal * promo.discount) / 100) : 0;
      const stamp = Date.now();
      const paymentGroup = `GRP-${stamp}-${Math.floor(Math.random() * 1000)}`;

      const guard = await tx.product.updateMany({
        where: { id: { in: productIds }, status: "AVAILABLE", approval: "APPROVED" },
        data: { status: "BOOKED" },
      });
      if (guard.count !== productIds.length) throw new Error("Beberapa produk baru saja dipesan orang lain");

      const storeEntries = [...byStore.entries()];
      let remainingDiscount = discountAmount;
      let shippingFee = 0;
      const orders: { id: string; orderNumber: string; storeId: string; sellerId: string }[] = [];
      storeEntries.forEach(([storeId, items], index) => {
        const storeSub = items.reduce((acc, p) => acc + p.price, 0);
        const weight = items.reduce((acc, p) => acc + (p.weight ?? 600), 0);
        const fee = quoteShipping({ city: address.city, courier, itemCount: items.length, totalWeightGram: weight, baseFee }).fee;
        const disc = index === storeEntries.length - 1 ? remainingDiscount : (subtotal ? Math.round(discountAmount * (storeSub / subtotal)) : 0);
        remainingDiscount -= disc;
        shippingFee += fee;
        const orderTotal = Math.max(0, storeSub + fee - disc);
        const orderNumber = `${paymentGroup}-${index}`;
        orders.push({ storeId, sellerId: items[0].store.userId, orderNumber, items, fee, disc, orderTotal } as never);
      });

      const created = [];
      for (const row of orders as unknown as { storeId: string; sellerId: string; orderNumber: string; items: typeof products; fee: number; disc: number; orderTotal: number }[]) {
        const order = await tx.order.create({
          data: {
            orderNumber: row.orderNumber,
            buyerId,
            storeId: row.storeId,
            totalPrice: row.orderTotal,
            shippingFee: row.fee,
            discountAmount: row.disc,
            promoCode: promo?.code ?? null,
            paymentGroup,
            status: "PENDING_PAYMENT",
            courier,
            shippingAddress: `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`,
            items: { create: row.items.map((p) => ({ productId: p.id, price: p.price })) },
          },
        });
        created.push({ id: order.id, orderNumber: row.orderNumber, storeId: row.storeId, sellerId: row.sellerId });
      }

      if (promo) {
        await tx.promo.update({ where: { code: promo.code }, data: { usageCount: { increment: 1 } } });
      }

      const total = created.reduce((acc, _o, i) => acc + (orders as unknown as { orderTotal: number }[])[i].orderTotal, 0);
      return {
        paymentGroup,
        orderNumber: created[0].orderNumber,
        total,
        discountAmount,
        shippingFee,
        items: products.map((p) => ({ id: p.id, price: p.price, name: p.title.slice(0, 50) })),
        orders: created,
      };
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout gagal" }, { status: 400 });
  }

  let token: string;
  try {
    token = await snap.createTransactionToken({
      transaction_details: { order_id: locked.paymentGroup, gross_amount: locked.total },
      customer_details: { email: session.user?.email || "", first_name: session.user?.name || "" },
      item_details: [
        ...locked.items.map((p) => ({ ...p, quantity: 1 })),
        { id: "shipping", price: locked.shippingFee, quantity: 1, name: "Biaya Pengiriman" },
        ...(locked.discountAmount > 0 ? [{ id: "discount", price: -locked.discountAmount, quantity: 1, name: "Diskon Promo" }] : []),
      ],
      expiry: { unit: "hour", duration: 24 },
    });
  } catch {
    await prisma.$transaction([
      prisma.order.updateMany({ where: { paymentGroup: locked.paymentGroup }, data: { status: "CANCELLED" } }),
      prisma.product.updateMany({ where: { id: { in: productIds }, status: "BOOKED" }, data: { status: "AVAILABLE" } }),
      ...(promo ? [prisma.promo.update({ where: { code: promo.code }, data: { usageCount: { decrement: 1 } } })] : []),
    ]);
    return NextResponse.json({ error: "Gagal membuat sesi pembayaran, silakan coba lagi" }, { status: 502 });
  }

  await prisma.order.updateMany({ where: { paymentGroup: locked.paymentGroup }, data: { snapToken: token } });
  await Promise.all(
    locked.orders.map((o) =>
      notify({
        userId: o.sellerId,
        type: "ORDER",
        title: "Pesanan baru masuk",
        body: `Order ${o.orderNumber} menunggu pembayaran.`,
        link: "/seller/orders",
      })
    )
  );

  const order = await prisma.order.findUnique({ where: { orderNumber: locked.orderNumber } });
  return NextResponse.json({ order, token, paymentGroup: locked.paymentGroup, orderCount: locked.orders.length });
}
