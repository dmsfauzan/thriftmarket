"use client";
import Link from "next/link";
import { useDrop } from "./ui";
import { useQuery } from "@tanstack/react-query";
import { Card, Stat } from "./cards";
import { Download, Plus } from "lucide-react";

export default function AdminOverview() {
  const { dd, open, setOpen, ref } = useDrop();
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await fetch("/api/admin/stats")).json() });
  const s = data?.stats ?? { users: 0, products: 0, orders: 0, stores: 0, reviews: 0, revenue: 0 };
  const orders: any[] = data?.recentOrders ?? [];
  const fmt = (n: number) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Overview</h1><p className="text-sm text-slate-500">September, 2024 • Ringkasan marketplace thrift</p></div>
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
          <p className="max-w-md text-2xl font-extrabold leading-snug">Swift Setup for New Teams</p>
          <p className="mt-2 max-w-md text-sm text-slate-300">Enhance team formation and management with easy tools for communication, task organization, and progress tracking.</p>
          <Link href="/admin/users" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900">Create Team</Link>
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-emerald-500/20 blur-2xl" />
        </div>
        <Card title="All time sales" action={<Link href="/admin/orders" className="text-xs font-semibold text-slate-500">Report →</Link>}>
          <p className="text-3xl font-black">{s.revenue > 1000 ? `$${(s.revenue / 15000 / 1000).toFixed(1)}k` : fmt(s.revenue)}</p>
          <p className="text-xs font-semibold text-emerald-600">+2.7% vs bulan lalu</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[["Bundle / Preloved", fmt(s.revenue), "3.9%"], ["Facebook Ads", "Rp85jt", "0.7%"], ["Instagram", "Rp36jt", "8.2%"], ["Google", "Rp26jt", "8.2%"], ["Retail", "Rp7jt", "0.7%"]].map(([a, b, c]) => (
              <li key={a} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"><span className="text-slate-500">{a}</span><span className="font-bold">{b} <span className="text-xs font-medium text-emerald-600">{c}</span></span></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Users" value={String(s.users)} sub="Buyers + Sellers" />
        <Stat label="Produk" value={String(s.products)} sub={`${s.stores} toko aktif`} />
        <Stat label="Pesanan" value={String(s.orders)} sub="Semua status" />
        <Stat label="Ulasan" value={String(s.reviews)} sub="Rating & komentar" />
      </div>

      <Card title="Pesanan Terbaru" action={<Link href="/admin/orders" className="text-xs font-semibold">Lihat Semua →</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400"><th className="py-2">Order</th><th>Pembeli</th><th>Toko</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="py-3 font-semibold">{o.orderNumber}</td>
                  <td className="text-slate-500">{o.buyer?.email}</td>
                  <td className="text-slate-500">{o.store?.storeName}</td>
                  <td className="font-semibold">{fmt(o.totalPrice)}</td>
                  <td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{o.status}</span></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-400">Belum ada pesanan — seed dulu atau buat order test.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
