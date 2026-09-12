"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, UserPlus, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", storeName: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "SELLER" }),
    });
    setLoading(false);
    if (r.ok) {
      router.push("/seller/login?registered=1");
    } else {
      const j = await r.json();
      const msg =
        (j.error as { fieldErrors?: Record<string, string[]> })?.fieldErrors?.storeName?.[0] ??
        (typeof j.error === "string" ? j.error : "Registrasi gagal.");
      setErr(msg);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col">
        <Link href="/" className="text-xl font-bold tracking-tight">ThriftMarket</Link>
        <div className="flex flex-1 flex-col justify-center gap-5">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"><Store size={14} /> Seller Center</p>
          <h1 className="max-w-md text-3xl font-bold leading-tight">Buka tokomu.<br />Admin akan meninjaunya.</h1>
          <ul className="space-y-3 text-sm text-slate-300">
            {[["Daftar + nama toko custom", "Nama toko akan dimoderasi admin."], ["Tunggu approval", "Akun & toko aktif setelah disetujui."] , ["Upload produk", "Setiap produk baru juga perlu approve admin (edit tidak) — reject bisa ajukan ulang."]].map(([a, b]) => (
              <li key={a} className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" /><span><b className="text-white">{a}</b> — {b}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center bg-sand px-4 py-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-forest">Daftar sebagai Penjual</h2>
          <p className="mt-1 text-sm text-forest/60">Nama toko & akun perlu persetujuan admin.</p>
          {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="relative"><UserPlus size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" /><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm" /></div>
            <div className="relative"><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm" /></div>
            <div className="relative"><Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" /><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 6)" type="password" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm" /></div>
            <div className="relative"><Store size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" /><input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} placeholder="Nama toko (min 3 huruf)" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm" /></div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Mendaftar..." : "Daftar & Ajukan Toko"} <ArrowRight size={16} /></button>
          </form>
          <p className="mt-4 text-center text-sm text-forest/60">Sudah punya akun seller? <Link href="/seller/login" className="font-semibold text-forest underline">Masuk Seller</Link></p>
          <p className="mt-2 text-center text-xs text-forest/40">Mau belanja saja? <Link href="/register" className="underline">Daftar Buyer</Link></p>
        </div>
      </div>
    </div>
  );
}
