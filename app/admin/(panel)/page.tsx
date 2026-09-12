"use client";
import Link from "next/link";
import { useDrop } from "./ui";
import { useQuery } from "@tanstack/react-query";
import { Card, Stat } from "./cards";
import { Download, Plus, TrendingUp, Package, Award, ArrowUpRight } from "lucide-react";
import { formatIDR } from "@/lib/utils";

function MiniBars({ values, color = "bg-slate-900" }: { values: number[]; color?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-1.5 h-14">
      {values.map((v, i) => (
        <span key={i} className={`flex-1 rounded-full ${color}`} style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 6 : 2 }} title={String(v)} />
      ))}
    </div>
  );
}
function Donut({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  let off = 0;
  const circ = 2 * Math.PI * 30;
  return (
    <div className="flex items-center gap-4">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={30} fill="none" strokeWidth={12} className="stroke-slate-100 dark:stroke-slate-800" />
        {data.map((d, i) => {
          const len = (d.value / total) * circ;
          const el = <circle key={d.label} cx={36} cy={36} r={30} fill="none" strokeWidth={12} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-off} className={colors[i % colors.length]} strokeLinecap="round" />;
          off += len;
          return el;
        })}
      </svg>
      <div className="space-y-1 text-xs">
        {data.map((d, i) => (
          <p key={d.label} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className={`h-2 w-2 rounded-full ${colors[i % colors.length].replace("stroke-", "bg-").replace("[", "").replace("]", "")}`} />
            {d.label} — {d.value}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const { dd, open, setOpen, ref } = useDrop();
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await fetch("/api/admin/stats")).json() });
  const s = data?.stats ?? { users: 0, products: 0, orders: 0, stores: 0, reviews: 0, revenue: 0 };
  const orders: any[] = data?.recentOrders ?? [];
  const trend: any[] = data?.trend ?? [];
  const topStores: any[] = data?.topStores ?? [];
  const topProducts: any[] = data?.topProducts ?? [];
  const approvalData = (data?.approvalBreakdown ?? []).map((x: any) => ({ label: x.approval, value: x._count }));
  const orderData = (data?.ordersByStatus ?? []).map((x: any) => ({ label: x.status, value: x._count }));
  const fmt = (n: number) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Overview</h1><p className="text-sm text-slate-500">Hari ini • tren 7 hari • top toko & produk</p></div>
        <div className="ml-auto flex gap-2">
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium"><Download size={15} /> Export</button>
            {dd && open && (
              <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                {["Email", "SMS", "Push"].map((x) => <button key={x} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">{x}</button>)}
              </div>
            )}
          </div>
          <Link href="/admin/products/new" className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"><Plus size={15} /> Tambah Produk</Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300"><TrendingUp size={14} /> ThriftMarket Analytics</p>
          <p className="mt-2 max-w-md text-2xl font-extrabold leading-snug">Tren 7 hari — order & omset</p>
          <p className="mt-2 max-w-md text-sm text-slate-300">Dipakai untuk pitch ke investor. Data di-refresh dari order PAID/SHIPPED/COMPLETED hari ini.</p>
          {trend.length > 0 && (
            <div className="mt-6 max-w-md">
              <MiniBars values={trend.map((t) => t.orders)} color="bg-emerald-400" />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">{trend.map((t) => <span key={t.label}>{t.label}</span>)}</div>
            </div>
          )}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-emerald-500/20 blur-2xl" />
        </div>
        <Card title="All time sales" action={<Link href="/admin/orders" className="text-xs font-semibold text-slate-500">Lihat Orders →</Link>}>
          <p className="text-3xl font-black">{fmt(s.revenue)}</p>
          <p className="text-xs font-semibold text-emerald-600">PAID + SHIPPED + COMPLETED</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Estimasi escrow cair</span><span className="font-bold">{fmt(s.revenue)}</span></li>
            <li className="flex justify-between"><span className="text-slate-500">Total transaksi</span><span className="font-bold">{s.orders} order</span></li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Users" value={String(s.users)} sub="Buyers + Sellers" />
        <Stat label="Produk" value={String(s.products)} sub={`${s.stores} toko aktif`} />
        <Stat label="Pesanan" value={String(s.orders)} sub="Semua status" />
        <Stat label="Ulasan" value={String(s.reviews)} sub="isHidden disaring" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Pesanan Terbaru" action={<Link href="/admin/orders" className="text-xs font-semibold">Lihat Semua →</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Order</th><th>Toko</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold">{o.orderNumber}</td>
                    <td className="text-slate-500">{o.store?.storeName}</td>
                    <td className="font-semibold">{fmt(o.totalPrice)}</td>
                    <td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{o.status}</span></td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">Belum ada pesanan.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Top Toko (rating)" action={<Link href="/admin/sellers" className="text-xs font-semibold">Sellers →</Link>}>
          <ul className="space-y-3">
            {topStores.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">{t.storeName?.[0] ?? "T"}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{t.storeName}</p><p className="text-xs text-slate-400">{t.user?.name} • {t._count.products} produk</p></div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><Award size={12} />{Number(t.rating ?? 0).toFixed(1)}</span>
              </li>
            ))}
            {topStores.length === 0 && <p className="text-sm text-slate-400">Belum ada toko.</p>}
          </ul>
        </Card>
        <Card title="Top Produk">
          <ul className="space-y-3">
            {topProducts.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.images?.[0]?.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{p.title}</p><p className="text-xs text-slate-400">{p.store?.storeName}</p></div>
                <Link href={`/products/${p.id}`} className="text-slate-400"><ArrowUpRight size={14} /></Link>
              </li>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-slate-400">Belum ada produk.</p>}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Approval Breakdown">
          <Donut data={approvalData.length ? approvalData : [{ label: "—", value: 1 }]} colors={["stroke-emerald-500", "stroke-amber-500", "stroke-red-500"]} />
        </Card>
        <Card title="Order Status">
          <Donut data={orderData.length ? orderData : [{ label: "—", value: 1 }]} colors={["stroke-blue-500", "stroke-purple-500", "stroke-slate-400", "stroke-emerald-500"]} />
        </Card>
      </div>
    </div>
  );
}
