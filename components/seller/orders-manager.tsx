"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/lib/utils";
import { Truck } from "lucide-react";

export function OrdersManager() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => (await fetch("/api/seller/orders")).json(),
  });
  const [resi, setResi] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("ALL");
  const orders = Array.isArray(data) ? data : [];
  const filtered = tab === "ALL" ? orders : orders.filter((o: any) => o.status === tab);
  const needShip = orders.filter((o: any) => o.status === "PAID").length;

  async function ship(id: string) {
    if (!resi[id]?.trim()) return alert("Isi nomor resi dulu");
    const r = await fetch("/api/seller/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: id, waybillNumber: resi[id].trim() }) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    refetch();
  }

  if (isLoading) return <p className="text-sm text-slate-500">Memuat pesanan...</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "PAID", "SHIPPED", "COMPLETED", "PENDING_PAYMENT", "CANCELLED"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${tab === t ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>
            {t}{t === "PAID" && needShip > 0 ? ` (${needShip})` : ""}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">Tidak ada pesanan {tab === "ALL" ? "" : tab.toLowerCase()}.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((o: any) => (
            <div key={o.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold">{o.orderNumber} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold">{o.status}</span></p>
                  <p className="mt-1 text-xs text-slate-500">{o.buyer?.email} • {o.shippingAddress} • {o.courier ?? "-"} {o.waybillNumber ? `• Resi ${o.waybillNumber}` : ""}</p>
                </div>
                <p className="font-black">{formatIDR(o.totalPrice)}</p>
              </div>
              <div className="mt-3 space-y-1.5">
                {o.items?.map((i: any) => (
                  <p key={i.id} className="flex items-center gap-2 text-sm text-slate-600"><img src={i.product?.images?.[0]?.url} className="h-8 w-8 rounded-lg object-cover" alt="" />{i.product?.title} — {formatIDR(i.price)}</p>
                ))}
              </div>
              {o.status === "PAID" && (
                <div className="mt-3 flex gap-2 rounded-2xl bg-emerald-50 p-3">
                  <input placeholder="Nomor resi JNE/J&T/SiCepat" value={resi[o.id] ?? ""} onChange={(e) => setResi({ ...resi, [o.id]: e.target.value })} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  <button onClick={() => ship(o.id)} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><Truck size={14} /> Kirim</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
