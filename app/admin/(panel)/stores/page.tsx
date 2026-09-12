import { prisma } from "@/lib/prisma";
import { Card, PageHead } from "../cards";
import { formatIDR } from "@/lib/utils";
import Link from "next/link";

export default async function AdminStores() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, sellerStatus: true, suspendedUntil: true } }, _count: { select: { products: true, orders: true } } },
  });
  return (
    <div className="space-y-6">
      <PageHead title="Toko & Storefront" sub={`${stores.length} toko terdaftar`} />
      <Card title="Daftar Store">
        <div className="space-y-3">
          {stores.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 p-4">
              {t.logoUrl ? <img src={t.logoUrl} className="h-10 w-10 rounded-xl object-cover" alt="" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{t.storeName[0]}</span>}
              <div className="flex-1">
                <p className="font-bold">{t.storeName} <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.approval === "APPROVED" ? "bg-emerald-100 text-emerald-700" : t.approval === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{t.approval}</span></p>
                <p className="text-xs text-slate-500">{t.user?.name} ({t.user?.email}) • {t._count.products} produk • {t._count.orders} order • ★ {Number(t.rating).toFixed(1)}</p>
              </div>
              <Link href={`/admin/sellers/${t.userId}`} className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold">Kelola →</Link>
            </div>
          ))}
          {stores.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Belum ada toko.</p>}
        </div>
      </Card>
    </div>
  );
}
