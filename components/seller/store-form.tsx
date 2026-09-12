"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ImagePlus } from "lucide-react";

export function StoreForm({ initial, approval, rejectReason }: { initial: { storeName: string; description: string; logoUrl: string }; approval: string; rejectReason: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const r = await fetch("/api/seller/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { setMsg("Tersimpan."); router.refresh(); }
    else setMsg((await r.json()).error ?? "Gagal menyimpan");
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900";
  return (
    <form onSubmit={save} className="max-w-xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {form.logoUrl ? <img src={form.logoUrl} alt="logo" className="h-14 w-14 rounded-2xl object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Store size={22} /></span>}
        <div>
          <p className="text-sm font-bold">Status Toko</p>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${approval === "APPROVED" ? "bg-emerald-100 text-emerald-700" : approval === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{approval}</span>
          {rejectReason && <p className="mt-1 text-xs text-red-600">Alasan: {rejectReason}</p>}
        </div>
      </div>
      {msg && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nama Toko</label>
        <input required minLength={3} value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className={input} />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deskripsi</label>
        <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400"><ImagePlus size={13} /> Logo URL</label>
        <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." className={input} />
      </div>
      <button disabled={saving} className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan Toko"}</button>
    </form>
  );
}
