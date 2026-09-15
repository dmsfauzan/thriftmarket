import { prisma } from "@/lib/prisma";

/**
 * Memindahkan dana escrow ke dompet seller (potong fee admin jika ada)
 */
export async function releaseEscrow(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { include: { user: { include: { wallet: true } } } } },
  });

  if (!order || order.status !== "COMPLETED") return;

  const sellerUserId = order.store.userId;
  const setting = await prisma.siteSetting.findUnique({ where: { key: "feePercent" } });
  const feePercent = Number(setting?.value ?? 0) || 0;
  
  const fee = Math.round((order.totalPrice - order.shippingFee) * (feePercent / 100));
  const amountToSeller = order.totalPrice - fee;

  await prisma.$transaction(async (tx) => {
    // 1. Dapatkan atau buat wallet seller
    let wallet = await tx.wallet.findUnique({ where: { userId: sellerUserId } });
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { userId: sellerUserId, balance: 0 } });
    }

    // 2. Tambah saldo
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountToSeller } },
    });

    // 3. Catat Ledger
    await tx.ledger.create({
      data: {
        walletId: wallet.id,
        orderId: order.id,
        amount: amountToSeller,
        type: "credit",
        description: `Hasil penjualan ${order.orderNumber} (potong fee ${feePercent}%)`,
      },
    });

    if (fee > 0) {
      // Opsional: catat ledger admin (jika ada wallet admin di masa depan)
    }
  });
}
