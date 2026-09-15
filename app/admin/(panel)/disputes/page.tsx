"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { useState } from "react";

export default function AdminDisputes() {
  const { data, refetch } = useQuery({ queryKey: ["admin-disputes"], queryFn: async () => (await fetch("/api/admin/disputes")).json() });
  const rows = Array.isArray(data) ? data : [];
  const [resolution, setResolution] = useState<Record<string, string>>({});

  async function resolve(id: string, status: string) {
    const r = await fetch("/api/admin/disputes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, resolution: resolution[id] ?? "", refundAmount: 0 }) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Sengketa / Dispute" sub="Escrow: refund = order CANCELLED + stok kembali AVAILABLE" />
      <Card title={`Daftar (${rows.length})`}>
        <div className="space-y-3">
          {rows.map((d: any) => (
            <div key={d.id} className="rounded-2xl border border-slate-100 p-4 text-sm">
              <p className="font-bold">{d.order?.orderNumber} — <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px]">{d.status}</span></p>
              <p className="mt-1 text-slate-600">{d.reason}</p>
              {d.evidenceUrl ? <a href={d.evidenceUrl} target="_blank" className="mt-1 block text-xs font-bold text-blue-600 underline">Bukti: {d.evidenceUrl.slice(0, 60)}</a> : <p className="text-[11px] text-slate-400">Tanpa bukti foto</p>}
              <p className="text-xs text-slate-400">{d.buyer?.email} • {d.buyer?.name} • {new Date(d.createdAt).toLocaleString("id-ID")}</p>
              {d.status === "OPEN" && (
                <div className="mt-2 flex gap-2">
                  <input value={resolution[d.id] ?? ""} onChange={(e) => setResolution({ ...resolution, [d.id]: e.target.value })} placeholder="Catatan resolusi" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <button onClick={() => resolve(d.id, "RESOLVED_REFUND")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Refund</button>
                  <button onClick={() => resolve(d.id, "RESOLVED_REJECTED")} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold">Tolak</button>
                </div>
              )}
              {d.status !== "OPEN" && <p className="mt-2 text-xs">Resolusi: {d.resolution ?? "-"}</p>}
            </div>
          ))}
          {rows.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Tidak ada sengketa.</p>}
        </div>
      </Card>
    </div>
  );
}
