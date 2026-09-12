"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Store, Mail, Lock, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BUYER" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (r.ok) router.push("/login");
    else setErr((await r.json()).error ?? "Registrasi gagal.");
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[0.8fr_1.2fr]">
      <div className="hidden bg-forest p-10 text-sand lg:flex lg:flex-col">
        <Link href="/" className="text-xl font-bold tracking-tight">ThriftMarket</Link>
        <div className="flex flex-1 flex-col justify-center gap-5">
          <h1 className="text-3xl font-bold">Gabung di ekosistem thrifting aman.</h1>
          <ul className="space-y-4">
            {[["Satu Stok Tunggal", "Sistem booking otomatis khusus produk unik."], ["Cek Kondisi PxL", "Detail minus dan ukuran real cm selalu ada."], ["Rekber Escrow", "Uang tidak langsung ke penjual. Aman dari penipuan."]].map(([h, p]) => (
              <li key={h} className="flex gap-3">
                <CheckCircle2 size={20} className="mt-1 text-sand/40 shrink-0" />
                <div><p className="font-semibold text-sm">{h}</p><p className="text-xs text-sand/60">{p}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-sand px-4 py-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-forest">Daftar Akun</h2>
          <p className="mt-1 text-sm text-forest/60">Pilih peran Anda dan mulai bertransaksi.</p>

          {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, role: "BUYER" })} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${form.role === "BUYER" ? "border-forest bg-forest/5 ring-2 ring-forest/10" : "border-sand-line bg-white hover:bg-sand-dark"}`}>
                <User size={20} className={form.role === "BUYER" ? "text-forest" : "text-forest/40"} />
                <span className="text-xs font-semibold text-forest">Pembeli</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: "SELLER" })} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${form.role === "SELLER" ? "border-forest bg-forest/5 ring-2 ring-forest/10" : "border-sand-line bg-white hover:bg-sand-dark"}`}>
                <Store size={20} className={form.role === "SELLER" ? "text-forest" : "text-forest/40"} />
                <span className="text-xs font-semibold text-forest">Penjual</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-forest/70">Nama Lengkap</label>
              <div className="relative">
                <UserPlus size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest" />
              </div>

              <label className="block text-xs font-medium text-forest/70">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" type="email" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest" />
              </div>

              <label className="block text-xs font-medium text-forest/70">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" />
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" type="password" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest" />
              </div>
            </div>

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-sm font-semibold text-sand shadow-sm hover:bg-forest-light disabled:opacity-60">
              {loading ? "Mendaftar..." : "Buat Akun"} <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-forest/60">
            Sudah punya akun? <Link href="/login" className="font-semibold text-forest underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
