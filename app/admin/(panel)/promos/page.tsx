"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { Ticket, Trash2, ToggleLeft } from "lucide-react";
import { useState } from "react";

export default function AdminPromos() {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [discount, setDiscount] = useState("10");
  const [exp, setExp] = useState("");
  const { data, refetch } = useQuery({ queryKey: ["admin-promos"], queryFn: async () => (await fetch("/api/admin/promos")).json() });
  const promos = Array.isArray(data) ? data : [];

  async function add() {
    const r = await fetch("/api/admin/promos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, label, discount: Number(discount), expiresAt: exp || null }) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setCode(""); setLabel(""); setDiscount("10"); setExp("");
    refetch();
  }
  async function toggle(id: string) {
    await fetch("/api/admin/promos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    refetch();
  }
  async function del(id: string) {
    if (!confirm("Hapus kupon ini?")) return;
    await fetch(`/api/admin/promos?id=${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Kupon & Promo" sub="Buat, aktifkan, dan kelola kode diskon" />
      <Card title="Tambah Kupon">
        <div className="grid gap-3 sm:grid-cols-4">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Kode (THRIFT10)" className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="number" min={1} max={90} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Diskon %" className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
          <input type="date" value={exp} onChange={(e) => setExp(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
        </div>
        <button onClick={add} className="mt-3 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Simpan Kupon</button>
      </Card>
      <Card title={`Daftar (${promos.length})`}>
        <div className="space-y-2">
          {promos.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Ticket size={16} /></span>
              <div className="flex-1"><p className="font-mono text-sm font-bold">{p.code} — {p.discount}% {p.isActive ? "" : "(nonaktif)"}</p><p className="text-xs text-slate-400">{p.label ?? "-"} • {p.expiresAt ? `exp ${new Date(p.expiresAt).toLocaleDateString("id-ID")}` : "tanpa batas"}</p></div>
              <button onClick={() => toggle(p.id)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${p.isActive ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}><ToggleLeft size={12} className="inline" /> {p.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
              <button onClick={() => del(p.id)} className="text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
          {promos.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Belum ada kupon.</p>}
        </div>
      </Card>
    </div>
  );
}
