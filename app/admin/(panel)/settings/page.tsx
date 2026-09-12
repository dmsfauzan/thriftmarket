"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { useState } from "react";

export default function AdminSettings() {
  const { data, refetch } = useQuery({ queryKey: ["admin-settings"], queryFn: async () => (await fetch("/api/admin/settings")).json() });
  const [form, setForm] = useState({ siteName: "", shippingFee: "", supportEmail: "", feePercent: "" });
  const s = (data ?? {}) as Record<string, string>;

  async function save() {
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setForm({ siteName: "", shippingFee: "", supportEmail: "", feePercent: "" });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Settings" sub="Branding, ongkir flat, dan support — data persis di DB" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Pengaturan Saat Ini">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-slate-500">Site Name</span><b>{s.siteName ?? "ThriftMarket SaaS"}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Ongkir Flat</span><b>Rp{Number(s.shippingFee ?? 15000).toLocaleString("id-ID")}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Support Email</span><b>{s.supportEmail ?? "-"}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Fee % (opsional)</span><b>{s.feePercent ? `${s.feePercent}%` : "-"}</b></li>
          </ul>
        </Card>
        <Card title="Edit">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Site Name</label>
            <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} placeholder="ThriftMarket SaaS" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Ongkir Flat (angka)</label>
            <input value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: e.target.value })} placeholder="15000" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Support Email</label>
            <input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} placeholder="support@thriftmarket.id" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
            <button onClick={save} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Simpan</button>
          </div>
        </Card>
      </div>
      <Card title="Integrations">
        <div className="space-y-3">
          {["Midtrans Snap (belakangi — tidak dieksekusi)", "Cloudinary Storage", "RajaOngkir (simulasi flat JNE/J&T/SiCepat)"].map((x) => (
            <div key={x} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><span className="text-sm font-bold">{x}</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Connected</span></div>
          ))}
        </div>
      </Card>
    </div>
  );
}
