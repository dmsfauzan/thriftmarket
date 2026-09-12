import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/utils";
import { Package, ClipboardList, Star, Plus, Truck } from "lucide-react";

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

export default async function SellerOverview() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { userId }, include: { _count: { select: { products: true, orders: true } } } });
  if (!store) return <p className="text-sm text-slate-500">Toko tidak ditemukan.</p>;

  const [pendingCount, rejectedCount, unpaidCount, rating, latestOrders] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id, approval: "PENDING" } }),
    prisma.product.count({ where: { storeId: store.id, approval: "REJECTED" } }),
    prisma.order.count({ where: { storeId: store.id, status: "PAID" } }),
    prisma.store.findUnique({ where: { id: store.id }, select: { rating: true } }),
    prisma.order.findMany({ where: { storeId: store.id }, take: 5, orderBy: { createdAt: "desc" }, include: { buyer: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">{store.storeName}</h1><p className="text-sm text-slate-500">Ringkasan tokomu — status approval real-time</p></div>
        <div className="ml-auto flex gap-2">
          <Link href="/seller/products/create" className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"><Plus size={15} /> Tambah Produk</Link>
          <Link href="/seller/orders" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold"><Truck size={15} /> Input Resi</Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Produk Live" value={String(store._count.products - pendingCount - rejectedCount)} sub={`${store._count.products} total listing`} />
        <Stat label="Menunggu Review" value={String(pendingCount)} sub="Butuh approve admin" />
        <Stat label="Perlu Dikirim" value={String(unpaidCount)} sub="Status PAID" />
        <Stat label="Rating Toko" value={(rating?.rating ?? 0).toFixed(1)} sub="Dari ulasan buyer" />
      </div>

      {rejectedCount > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>{rejectedCount} produk ditolak admin.</b> Buka inventori, perbaiki, lalu klik "Ajukan Ulang". <Link href="/seller/products" className="font-bold underline">Ke Inventori →</Link>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Pesanan Terbaru</h2>
          <Link href="/seller/orders" className="text-xs font-semibold text-slate-500">Semua Pesanan →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Order</th><th>Pembeli</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {latestOrders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="py-3 font-semibold">{o.orderNumber}</td>
                  <td className="text-slate-500">{o.buyer?.email}</td>
                  <td className="font-semibold">{formatIDR(o.totalPrice)}</td>
                  <td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{o.status}</span></td>
                </tr>
              ))}
              {latestOrders.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">Belum ada pesanan.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-3">
        <Link href="/seller/products" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold shadow-sm hover:bg-slate-50"><Package size={18} /> Kelola Inventori</Link>
        <Link href="/seller/orders" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold shadow-sm hover:bg-slate-50"><ClipboardList size={18} /> Pesanan & Resi</Link>
        <Link href="/seller/reviews" className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold shadow-sm hover:bg-slate-50"><Star size={18} /> Ulasan Tokomu</Link>
      </div>
    </div>
  );
}
