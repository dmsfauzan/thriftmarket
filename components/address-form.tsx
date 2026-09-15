"use client";
import { useState } from "react";

type AddressFormState = { label: string; street: string; city: string; province: string; postalCode: string; latitude: number | null; longitude: number | null; provinceId: string; cityId: string; subdistrictId: string; phone: string; isPrimary: boolean };
export const EMPTY_ADDRESS: AddressFormState = { label: "Rumah", street: "", city: "", province: "", postalCode: "", latitude: null, longitude: null, provinceId: "", cityId: "", subdistrictId: "", phone: "", isPrimary: false };

const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400";

export function AddressForm({ onSaved, compact = false }: { onSaved?: () => void; compact?: boolean }) {
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    setErr("");
    if (!navigator.geolocation) return setErr("Browser tidak mendukung lokasi.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: Number(pos.coords.latitude.toFixed(7)), longitude: Number(pos.coords.longitude.toFixed(7)) }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setErr("Gagal mengambil lokasi. Isi manual atau izinkan akses lokasi.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setOk(false);
    const payload = { ...form, latitude: form.latitude ?? undefined, longitude: form.longitude ?? undefined };
    const r = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!r.ok) return setErr((await r.json()).error ?? "Gagal menyimpan");
    setForm(EMPTY_ADDRESS);
    setOk(true);
    onSaved?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">{err}</p>}
      {ok && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Alamat tersimpan.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (Rumah/Kantor)" className={input} />
        <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="Kode pos" inputMode="numeric" className={input} />
      </div>
      <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Jalan, nomor, RT/RW" className={input} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kota" className={input} />
        <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Provinsi" className={input} />
      </div>
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="No. HP (+62812...)" inputMode="tel" className={input} />
      <div className="rounded-xl border border-sand-line p-3 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Koordinat (untuk Lalamove)</span>
          <button type="button" onClick={useMyLocation} disabled={locating} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold dark:border-slate-600 dark:text-white">
            {locating ? "Mengambil..." : "Gunakan lokasi saya"}
          </button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input value={form.latitude ?? ""} onChange={(e) => setForm({ ...form, latitude: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Latitude (mis. -6.2000000)" inputMode="decimal" className={input} />
          <input value={form.longitude ?? ""} onChange={(e) => setForm({ ...form, longitude: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Longitude (mis. 106.8166667)" inputMode="decimal" className={input} />
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Opsional untuk ekspedisi, wajib untuk pengiriman instan Lalamove.</p>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="h-4 w-4" />
        Jadikan alamat utama
      </label>
      <button disabled={saving} className={`w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-emerald-600 ${compact ? "" : ""}`}>
        {saving ? "Menyimpan..." : "Simpan Alamat"}
      </button>
    </form>
  );
}
