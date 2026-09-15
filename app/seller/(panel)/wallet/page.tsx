"use client";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/lib/utils";
import { useState } from "react";

export default function SellerWallet() {
  const { data, refetch } = useQuery({ queryKey: ["seller-wallet"], queryFn: async () => (await fetch("/api/seller/wallet")).json() });
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  async function withdraw() {
    setErr("");
    const r = await fetch("/api/seller/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), reason }) });
    const j = await r.json();
    if (!r.ok) return setErr(j.error ?? "Gagal");
    setAmount(""); setReason("");
    refetch();
  }

  if (!data?.id) return <p className="text-sm text-slate-500">Memuat dompet...</p>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Dompet Seller</h1><p className="text-sm text-slate-500">Dana cair setelah pesanan COMPLETED (potong fee admin)</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs uppercase tracking-widest text-slate-400">Saldo Tersedia</p>
        <p className="mt-1 text-4xl font-black">{formatIDR(data.balance ?? 0)}</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3">
        <b className="text-sm">Ajukan Penarikan</b>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <input type="number" min={50000} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nominal (min Rp50.000)" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Catatan (opsional)" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
        <button onClick={withdraw} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Tarik Dana</button>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <b className="text-sm">Riwayat Ledger</b>
        <ul className="mt-3 space-y-2 text-sm">
          {(data.ledgers ?? []).map((l: any) => (
            <li key={l.id} className="flex justify-between border-b border-slate-100 pb-2">
              <span>{l.description}<br /><span className="text-[11px] text-slate-400">{new Date(l.createdAt).toLocaleString("id-ID")}</span></span>
              <b className={l.amount >= 0 ? "text-emerald-700" : "text-red-600"}>{l.amount >= 0 ? "+" : ""}{formatIDR(l.amount)}</b>
            </li>
          ))}
          {(data.ledgers ?? []).length === 0 && <p className="text-sm text-slate-400">Belum ada transaksi.</p>}
        </ul>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <b className="text-sm">Penarikan</b>
        <ul className="mt-3 space-y-2 text-sm">
          {(data.withdrawals ?? []).map((w: any) => (
            <li key={w.id} className="flex justify-between">
              <span>{formatIDR(w.amount)} — {w.status}<br /><span className="text-[11px] text-slate-400">{new Date(w.createdAt).toLocaleString("id-ID")}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
