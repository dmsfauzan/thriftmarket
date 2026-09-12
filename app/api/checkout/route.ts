import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

const SHIPPING_FEE = 15000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const buyerId = (session.user as { id: string }).id;

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const productIds = [...new Set(parsed.data.productIds)];
  const { addressId, courier } = parsed.data;

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: buyerId } });
  if (!address) return NextResponse.json({ error: "Alamat tidak valid" }, { status: 400 });

  let locked: { orderId: string; orderNumber: string; total: number; items: { id: string; price: number; name: string }[] };
  try {
    locked = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: productIds } }, include: { store: true } });
      if (products.length !== productIds.length) throw new Error("Beberapa produk sudah tidak tersedia");
      if (products.some((p) => p.status !== "AVAILABLE" || p.approval !== "APPROVED")) throw new Error("Beberapa produk belum disetujui admin atau sudah tidak tersedia");

      const storeId = products[0].storeId;
      if (!products.every((p) => p.storeId === storeId)) throw new Error("Hanya bisa checkout produk dari toko yang sama");
      if (products[0].store.userId === buyerId) throw new Error("Tidak bisa membeli produk dari tokomu sendiri");

      const subtotal = products.reduce((acc, p) => acc + p.price, 0);
      const total = subtotal + SHIPPING_FEE;
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const guard = await tx.product.updateMany({
        where: { id: { in: productIds }, status: "AVAILABLE", approval: "APPROVED" },
        data: { status: "BOOKED" },
      });
      if (guard.count !== productIds.length) throw new Error("Beberapa produk baru saja dipesan orang lain");

      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          storeId,
          totalPrice: total,
          shippingFee: SHIPPING_FEE,
          status: "PENDING_PAYMENT",
          courier,
          shippingAddress: `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`,
          items: { create: products.map((p) => ({ productId: p.id, price: p.price })) },
        },
      });
      return {
        orderId: order.id,
        orderNumber,
        total,
        items: products.map((p) => ({ id: p.id, price: p.price, name: p.title.slice(0, 50) })),
      };
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout gagal" }, { status: 400 });
  }

  let token: string;
  try {
    token = await snap.createTransactionToken({
      transaction_details: { order_id: locked.orderNumber, gross_amount: locked.total },
      customer_details: { email: session.user?.email || "", first_name: session.user?.name || "" },
      item_details: [...locked.items.map((p) => ({ ...p, quantity: 1 })), { id: "shipping", price: SHIPPING_FEE, quantity: 1, name: "Biaya Pengiriman" }],
      expiry: { unit: "hour", duration: 24 },
    });
  } catch {
    await prisma.$transaction([
      prisma.order.update({ where: { id: locked.orderId }, data: { status: "CANCELLED" } }),
      prisma.product.updateMany({ where: { id: { in: productIds }, status: "BOOKED" }, data: { status: "AVAILABLE" } }),
    ]);
    return NextResponse.json({ error: "Gagal membuat sesi pembayaran, silakan coba lagi" }, { status: 502 });
  }

  const order = await prisma.order.update({ where: { id: locked.orderId }, data: { snapToken: token } });
  return NextResponse.json({ order, token });
}
