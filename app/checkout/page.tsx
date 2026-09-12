"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { formatIDR } from "@/lib/utils";
import { AddressForm } from "@/components/address-form";
import { Modal } from "@/components/ui/modal";

declare global { interface Window { snap: { pay: (token: string) => void } } }

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const ids = (sp.get("ids") ?? "").split(",").filter(Boolean);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState("");
  const [courier, setCourier] = useState("JNE");
  const [addOpen, setAddOpen] = useState(false);
  const [err, setErr] = useState("");
  async function loadAddresses() {
    const a = await fetch("/api/addresses").then((res) => res.json());
    setAddresses(a);
    const p = a.find((x: any) => x.isPrimary) ?? a[0];
    if (p) setAddressId(p.id);
    return a;
  }
  useEffect(() => { loadAddresses(); }, []);
  async function pay() {
    setErr("");
    if (!addressId) return setErr("Pilih alamat pengiriman dulu.");
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productIds: ids, addressId, courier }) });
    const j = await r.json();
    if (!r.ok) return setErr(typeof j.error === "string" ? j.error : "Checkout gagal.");
    window.snap.pay(j.token);
    router.push(`/orders/${j.order.orderNumber}`);
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 dark:bg-slate-950">
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />
      <h1 className="text-xl font-bold dark:text-white">Checkout Escrow ({ids.length} item)</h1>
      {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">{err}</p>}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm dark:text-slate-200">Alamat Pengiriman</label>
          <button onClick={() => setAddOpen(true)} className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold dark:border-slate-600 dark:text-white">+ Alamat Baru</button>
        </div>
        <select value={addressId} onChange={(e) => setAddressId(e.target.value)} className="w-full rounded-xl border border-sand-line bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Pilih alamat</option>
          {addresses.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.street}, {a.city}</option>)}
        </select>
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Alamat">
          <AddressForm onSaved={async () => { const a = await loadAddresses(); if (a?.length) { setAddOpen(false); } }} />
        </Modal>
        <label className="text-sm dark:text-slate-200">Kurir (simulasi ongkir Rp15.000)</label>
        <div className="grid grid-cols-3 gap-2">
          {["JNE", "JNT", "SICEPAT"].map((c) => <button key={c} onClick={() => setCourier(c)} className={`rounded-xl border px-3 py-2 dark:text-white ${courier === c ? "border-forest bg-forest text-sand dark:border-emerald-500 dark:bg-emerald-600" : "border-sand-line dark:border-slate-700 dark:bg-slate-800"}`}>{c} • {formatIDR(15000)}</button>)}
        </div>
        <button onClick={pay} className="w-full rounded-xl bg-forest py-3 font-semibold text-sand dark:bg-emerald-600 dark:text-white">Bayar dengan Midtrans Snap</button>
      </div>
    </div>
  );
}
