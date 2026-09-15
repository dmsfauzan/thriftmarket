"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { formatIDR } from "@/lib/utils";
import { AddressForm } from "@/components/address-form";
import { Modal } from "@/components/ui/modal";

declare global { interface Window { snap: { pay: (token: string) => void } } }

type Quote = { courier: string; label: string; fee: number; eta: string };
type Product = { id: string; title: string; price: number; storeId: string; store?: { storeName: string } };

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const ids = (sp.get("ids") ?? "").split(",").filter(Boolean);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState("");
  const [courier, setCourier] = useState("JNE");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = addresses.find((a) => a.id === addressId);
  const subtotal = useMemo(() => products.reduce((a, p) => a + p.price, 0), [products]);
  const shipping = quotes.find((q) => q.courier === courier)?.fee ?? 15000;
  const discount = promo ? Math.round((subtotal * promo.discount) / 100) : 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const storeCount = new Set(products.map((p) => p.storeId)).size;

  async function loadAddresses() {
    const a = await fetch("/api/addresses").then((res) => res.json());
    setAddresses(a);
    const p = a.find((x: any) => x.isPrimary) ?? a[0];
    if (p) setAddressId(p.id);
    return a;
  }

  useEffect(() => { loadAddresses(); }, []);
  useEffect(() => {
    if (!ids.length) return;
    Promise.all(ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.ok ? r.json() : null)))
      .then((rows) => setProducts(rows.filter(Boolean)));
  }, [ids.join(",")]);

  useEffect(() => {
    if (!addressId) return;
    fetch("/api/checkout/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids, addressId, courier, promoCode: promoCode || undefined }),
    }).then((r) => r.json()).then((j) => {
      if (Array.isArray(j.quotes)) setQuotes(j.quotes);
      setPromo(j.promo ?? null);
    }).catch(() => null);
  }, [addressId, courier, promoCode, ids.join(",")]);

  async function applyPromo() {
    setErr("");
    const r = await fetch("/api/checkout/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids, addressId, courier, promoCode }),
    });
    const j = await r.json();
    if (!j.promo) return setErr("Kode promo tidak valid / kedaluwarsa.");
    setPromo(j.promo);
  }

  async function pay() {
    setErr("");
    if (!addressId) return setErr("Pilih alamat pengiriman dulu.");
    setLoading(true);
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productIds: ids, addressId, courier, promoCode: promoCode || undefined }) });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) return setErr(typeof j.error === "string" ? j.error : "Checkout gagal.");
    window.snap.pay(j.token);
    router.push(`/orders/${j.order.orderNumber}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 dark:bg-slate-950">
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />
      <h1 className="text-xl font-bold dark:text-white">Checkout Escrow ({ids.length} item{storeCount > 1 ? ` · ${storeCount} toko` : ""})</h1>
      {storeCount > 1 && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Multi-merchant: 1 pembayaran, {storeCount} pesanan terpisah per toko.</p>}
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
        <label className="text-sm dark:text-slate-200">Kurir {selected ? `ke ${selected.city}` : ""}</label>
        <div className="grid grid-cols-3 gap-2">
          {(quotes.length ? quotes : [{ courier: "JNE", fee: 15000, eta: "2-4 hari", label: "JNE" }, { courier: "JNT", fee: 13500, eta: "2-3 hari", label: "J&T" }, { courier: "SICEPAT", fee: 17250, eta: "1-3 hari", label: "SiCepat" }]).map((c) => (
            <button key={c.courier} onClick={() => setCourier(c.courier)} className={`rounded-xl border px-3 py-2 text-left text-xs dark:text-white ${courier === c.courier ? "border-forest bg-forest text-sand dark:border-emerald-500 dark:bg-emerald-600" : "border-sand-line dark:border-slate-700 dark:bg-slate-800"}`}>
              <b>{c.courier}</b>
              <p>{formatIDR(c.fee)}</p>
              <p className="opacity-80">{c.eta}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Kode promo" className="flex-1 rounded-xl border border-sand-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          <button onClick={applyPromo} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600 dark:text-white">Pakai</button>
        </div>
        {promo && <p className="text-xs text-emerald-700 dark:text-emerald-300">Promo {promo.code} — {promo.discount}% (−{formatIDR(discount)})</p>}
        <div className="rounded-2xl border border-sand-line p-4 text-sm dark:border-slate-700">
          <p className="flex justify-between"><span>Subtotal</span><b>{formatIDR(subtotal)}</b></p>
          <p className="mt-1 flex justify-between"><span>Ongkir</span><b>{formatIDR(shipping)}</b></p>
          {discount > 0 && <p className="mt-1 flex justify-between text-emerald-700"><span>Diskon</span><b>−{formatIDR(discount)}</b></p>}
          <p className="mt-2 flex justify-between border-t border-sand-line pt-2 text-base dark:border-slate-700"><span>Total</span><b>{formatIDR(total)}</b></p>
        </div>
        <button disabled={loading} onClick={pay} className="w-full rounded-xl bg-forest py-3 font-semibold text-sand disabled:opacity-50 dark:bg-emerald-600 dark:text-white">{loading ? "Memproses..." : "Bayar dengan Midtrans Snap"}</button>
      </div>
    </div>
  );
}
