"use client";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/lib/utils";

export default function SellerAnalytics() {
  const { data } = useQuery({ queryKey: ["seller-analytics"], queryFn: async () => (await fetch("/api/seller/analytics")).json() });
  if (!data) return <p className="text-sm text-slate-500">Memuat analitik...</p>;
  const max = Math.max(1, ...((data.trend ?? []).map((t: any) => t.orders)));
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Analitik Toko</h1><p className="text-sm text-slate-500">Omset kotor, bersih (fee {data.feePercent ?? 0}%), rating, status</p></div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-xs uppercase tracking-widest text-slate-400">Omset Kotor</p><p className="mt-1 text-2xl font-black">{formatIDR(data.revenue ?? 0)}</p></div>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-xs uppercase tracking-widest text-emerald-600">Bersih (Net)</p><p className="mt-1 text-2xl font-black text-emerald-700">{formatIDR(data.net ?? 0)}</p><p className="text-[11px] text-emerald-600">Fee {formatIDR(data.fee ?? 0)}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-xs uppercase tracking-widest text-slate-400">Produk</p><p className="mt-1 text-2xl font-black">{data.products ?? 0}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-xs uppercase tracking-widest text-slate-400">Rating</p><p className="mt-1 text-2xl font-black">{Number(data.rating ?? 0).toFixed(1)}★</p><p className="text-xs text-slate-500">{data.reviewCount ?? 0} ulasan</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-xs uppercase tracking-widest text-slate-400">Status Pesanan</p><ul className="mt-1 text-sm">{(data.orders ?? []).map((o: any) => <li key={o.status} className="flex justify-between"><span>{o.status}</span><b>{o._count}</b></li>)}</ul></div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <b className="text-sm">Tren 7 Hari (order)</b>
        <div className="mt-4 flex h-24 items-end gap-2">
          {(data.trend ?? []).map((t: any, i: number) => (
            <div key={i} className="flex-1 rounded-full bg-slate-900" style={{ height: `${(t.orders / max) * 100}%`, minHeight: t.orders > 0 ? 8 : 2 }} title={`${t.label}: ${t.orders}`} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">{(data.trend ?? []).map((t: any, i: number) => <span key={i}>{t.label}</span>)}</div>
      </div>
    </div>
  );
}
