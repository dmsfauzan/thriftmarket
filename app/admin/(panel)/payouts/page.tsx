"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { formatIDR } from "@/lib/utils";
import { useState } from "react";

export default function AdminPayouts() {
  const { data, refetch } = useQuery({ queryKey: ["admin-payouts"], queryFn: async () => (await fetch("/api/admin/payouts")).json() });
  const rows = Array.isArray(data) ? data : [];
  const [note, setNote] = useState<Record<string, string>>({});

  async function act(id: string, status: string) {
    const r = await fetch("/api/admin/payouts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, adminNote: note[id] ?? "" }) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Payout Seller" sub="Setujui transfer atau tolak (saldo dikembalikan)" />
      <Card title={`Pengajuan (${rows.length})`}>
        <div className="space-y-3">
          {rows.map((w: any) => (
            <div key={w.id} className="rounded-2xl border border-slate-100 p-4 text-sm">
              <p className="font-bold">{w.wallet?.user?.name} ({w.wallet?.user?.email}) — {formatIDR(w.amount)} <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px]">{w.status}</span></p>
              <p className="text-xs text-slate-400">{w.reason} • {new Date(w.createdAt).toLocaleString("id-ID")}</p>
              {w.status === "PENDING" && (
                <div className="mt-2 flex gap-2">
                  <input value={note[w.id] ?? ""} onChange={(e) => setNote({ ...note, [w.id]: e.target.value })} placeholder="Catatan admin" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <button onClick={() => act(w.id, "COMPLETED")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Transfer</button>
                  <button onClick={() => act(w.id, "REJECTED")} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold">Tolak</button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Tidak ada pengajuan.</p>}
        </div>
      </Card>
    </div>
  );
}
