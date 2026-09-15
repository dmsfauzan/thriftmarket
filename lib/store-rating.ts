import { prisma } from "@/lib/prisma";

export async function recalcStoreRating(storeId: string) {
  const agg = await prisma.review.aggregate({
    where: { product: { storeId }, isHidden: false },
    _avg: { rating: true },
  });
  await prisma.store.update({
    where: { id: storeId },
    data: { rating: agg._avg.rating ?? 0 },
  });
}
