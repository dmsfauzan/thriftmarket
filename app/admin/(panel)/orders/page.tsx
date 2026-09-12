"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { formatIDR } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

const STATUS = ["ALL", "PENDING_PAYMENT", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function AdminOrders() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("ALL");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { data, refetch } = useQuery({
    queryKey: ["admin-orders", q, tab],
    queryFn: async () => (await fetch(`/api/admin/orders?q=${encodeURIComponent(q)}&status=${tab}`)).json(),
  });
  const orders = Array.isArray(data) ? data : [];

  async function update(id: string, status: string) {
    const r = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Pesanan" sub="Cari, filter status, dan lihat timeline tiap order">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order # / email / nama..." className="rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-slate-900" /></div>
      </PageHead>
      <div className="flex flex-wrap gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 w-fit">
        {STATUS.map((s) => (
          <button key={s} onClick={() => setTab(s)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${tab === s ? "bg-slate-900 text-white" : "text-slate-500"}`}>{s.replace(/_/g, " ")}</button>
        ))}
      </div>
      <Card title={`Hasil (${orders.length})`}>
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="rounded-2xl border border-slate-100 p-4">
              <button onClick={() => setOpen((p) => ({ ...p, [o.id]: !p[o.id] }))} className="flex w-full items-center gap-3 text-left">
                <div className="flex-1">
                  <p className="font-bold">{o.orderNumber} <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${o.status === "PAID" ? "bg-emerald-100 text-emerald-700" : o.status === "SHIPPED" ? "bg-blue-100 text-blue-700" : o.status === "COMPLETED" ? "bg-purple-100 text-purple-700" : o.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{o.status}</span></p>
                  <p className="text-xs text-slate-500">{o.buyer?.name} ({o.buyer?.email}) • {o.store?.storeName} • {formatIDR(o.totalPrice)}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition ${open[o.id] ? "rotate-180" : ""}`} />
              </button>
              {open[o.id] && (
                <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 text-sm sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p><b>Timeline:</b></p>
                    <ul className="list-disc pl-5 text-xs text-slate-500">
                      <li>Dibuat: {new Date(o.createdAt).toLocaleString("id-ID")}</li>
                      {o.paidAt && <li>Dibayar: {new Date(o.paidAt).toLocaleString("id-ID")}</li>}
                      {o.shippedAt && <li>Dikirim: {new Date(o.shippedAt).toLocaleString("id-ID")}</li>}
                      {o.completedAt && <li>Selesai: {new Date(o.completedAt).toLocaleString("id-ID")}</li>}
                    </ul>
                    <p className="text-xs">Kurir: {o.courier ?? "-"} • Resi: {o.waybillNumber ?? "-"} • Ongkir: {formatIDR(o.shippingFee)}</p>
                    <p className="text-xs">Alamat: {o.shippingAddress}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p><b>Items:</b></p>
                    {o.items?.map((i: any) => <p key={i.id} className="flex items-center gap-2 text-xs"><img src={i.product?.images?.[0]?.url} className="h-7 w-7 rounded-lg object-cover" alt="" />{i.product?.title} — {formatIDR(i.price)}</p>)}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {["PAID", "SHIPPED", "COMPLETED", "CANCELLED"].map((st) => (
                        <button key={st} disabled={o.status === st} onClick={() => update(o.id, st)} className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold disabled:opacity-40">{st}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Tidak ada pesanan.</p>}
        </div>
      </Card>
    </div>
  );
}
