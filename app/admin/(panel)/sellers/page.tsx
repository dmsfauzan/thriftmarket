"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";

export default function AdminSellers() {
  const [tab, setTab] = useState("PENDING");
  const [reason, setReason] = useState<Record<string, string>>({});
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-sellers", tab],
    queryFn: async () => (await fetch(`/api/admin/sellers?status=${tab}`)).json(),
  });
  const sellers = Array.isArray(data) ? data : [];

  async function act(sellerId: string, action: "APPROVE" | "REJECT") {
    if (action === "REJECT" && !reason[sellerId]?.trim()) return alert("Isi alasan penolakan dulu");
    const r = await fetch("/api/admin/sellers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId, action, reason: reason[sellerId]?.trim() }),
    });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setReason((s) => ({ ...s, [sellerId]: "" }));
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Sellers" sub="Moderasi akun & toko penjual">
        <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1">
          {["PENDING", "APPROVED", "REJECTED"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${tab === t ? "bg-slate-900 text-white" : "text-slate-500"}`}>{t}</button>
          ))}
        </div>
      </PageHead>
      <Card title={`${tab} (${sellers.length})`}>
        {isLoading ? <p className="text-sm text-slate-400">Memuat...</p> : sellers.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Tidak ada seller {tab.toLowerCase()}.</p>
        ) : (
          <div className="space-y-3">
            {sellers.map((s: any) => (
              <div key={s.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1">
                    <p className="font-bold">{s.name} <span className="text-xs font-normal text-slate-400">{s.email}</span></p>
                    <p className="text-sm text-slate-600">Toko: <b>{s.store?.storeName}</b> • {s.store?._count?.products ?? 0} produk</p>
                    {s.sellerRejectReason && <p className="text-xs text-red-600">Alasan tolak sebelumnya: {s.sellerRejectReason}</p>}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.sellerStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" : s.sellerStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{s.sellerStatus}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {(tab === "PENDING" || tab === "REJECTED") && (
                    <button onClick={() => act(s.id, "APPROVE")} className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">Approve</button>
                  )}
                  {tab !== "REJECTED" && (
                    <div className="flex flex-1 gap-2">
                      <input value={reason[s.id] ?? ""} onChange={(e) => setReason({ ...reason, [s.id]: e.target.value })} placeholder="Alasan penolakan..." className="flex-1 rounded-full border border-slate-200 px-4 py-1.5 text-xs" />
                      <button onClick={() => act(s.id, "REJECT")} className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-600">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
