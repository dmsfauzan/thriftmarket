"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { Search, EyeOff, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AdminReviews() {
  const [q, setQ] = useState("");
  const { data, refetch } = useQuery({ queryKey: ["admin-reviews", q], queryFn: async () => (await fetch(`/api/admin/reviews?q=${encodeURIComponent(q)}`)).json() });
  const reviews = Array.isArray(data) ? data : [];

  async function toggle(id: string, hidden: boolean) {
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, hidden: !hidden }) });
    refetch();
  }
  async function del(id: string) {
    if (!confirm("Hapus ulasan permanen?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Ulasan" sub="Moderasi real — sembunyikan atau hapus ulasan buyer" >
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk / toko / komentar..." className="rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-slate-900" /></div>
      </PageHead>
      <Card title={`Ulasan (${reviews.length})`}>
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className={`rounded-2xl border p-4 ${r.isHidden ? "border-red-200 bg-red-50/50" : "border-slate-100 bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold">{r.product?.title} <span className="text-xs font-normal text-slate-400">({r.product?.store?.storeName})</span> <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">{r.rating}/5</span> {r.isHidden && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">HIDDEN</span>}</p>
                  <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                  <p className="mt-1 text-xs text-slate-400">{r.user?.name} ({r.user?.email}) • Order {r.order?.orderNumber} • {new Date(r.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggle(r.id, r.isHidden)} className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold">{r.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}{r.isHidden ? "Tampilkan" : "Sembunyikan"}</button>
                <button onClick={() => del(r.id)} className="text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Belum ada ulasan.</p>}
        </div>
      </Card>
    </div>
  );
}
