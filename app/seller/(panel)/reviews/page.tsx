import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SellerReviewsPage() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return <p className="text-sm text-slate-500">Toko tidak ditemukan.</p>;
  const reviews = await prisma.review.findMany({ where: { product: { storeId: store.id } }, orderBy: { createdAt: "desc" }, include: { product: { select: { title: true } }, user: { select: { name: true } } } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Ulasan Pelanggan</h1><p className="text-sm text-slate-500">Hanya untuk tokomu • {reviews.length} ulasan</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {reviews.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">Belum ada ulasan untuk tokomu.</p> : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-bold">{r.product.title} — <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></p>
                <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                <p className="mt-1 text-xs text-slate-400">{r.user.name} • {r.createdAt.toLocaleDateString("id-ID")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
