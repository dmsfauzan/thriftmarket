"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await signIn("credentials", { email, password, redirect: false });
    if (r?.error) {
      setLoading(false);
      return setErr("Email atau password salah.");
    }
    const s = await fetch("/api/auth/session").then((res) => res.json()).catch(() => null);
    const role = (s?.user as { role?: string } | undefined)?.role;
    setLoading(false);
    if (role === "ADMIN") {
      await signOut({ redirect: false });
      return setErr("Akun admin hanya bisa masuk via /admin/login");
    }
    if (role === "SELLER") {
      await signOut({ redirect: false });
      return setErr("Akun penjual hanya bisa masuk via /seller/login");
    }
    router.push("/");
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hidden bg-forest p-10 text-sand lg:flex lg:flex-col">
        <Link href="/" className="text-xl font-bold tracking-tight">ThriftMarket</Link>
        <div className="flex flex-1 flex-col justify-center gap-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"><Sparkles size={14} /> Preloved berkualitas — 1 item, 1 stok</p>
          <h1 className="max-w-md text-4xl font-bold leading-tight">Selamat datang kembali. Lanjut berburu thrift pilihan.</h1>
          <p className="max-w-md text-sm leading-relaxed text-sand/70">Setiap produk difoto detail termasuk minus/defect, lengkap ukuran PxL cm. Transaksi escrow aman sampai barang diterima.</p>
          <div className="mt-2 grid max-w-md grid-cols-3 gap-3 text-xs">
            {[["Transparan", "Foto defect jujur"], ["Escrow", "Dana aman"], ["Ter kurasi", "Sudah dicuci"]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-white/10 p-3"><p className="font-semibold">{a}</p><p className="text-sand/60">{b}</p></div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sand/50">© ThriftMarket • #2B3A30 earthy theme</p>
      </div>

      <div className="flex items-center justify-center bg-sand px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden"><Link href="/" className="text-lg font-bold text-forest">ThriftMarket</Link></div>
          <h2 className="text-2xl font-bold text-forest">Masuk</h2>
          <p className="mt-1 text-sm text-forest/60">Masuk untuk checkout, lacak pesanan & buka toko.</p>

          {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block text-xs font-medium text-forest/70">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" type="email" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10" />
            </div>

            <label className="block text-xs font-medium text-forest/70">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="Minimal 6 karakter" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10" />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/50">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-sm font-semibold text-sand shadow-sm hover:bg-forest-light disabled:opacity-60">
              {loading ? "Memproses..." : "Masuk"} <ArrowRight size={16} />
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-sand-line" />
              <span className="text-xs text-forest/40">atau</span>
              <span className="h-px flex-1 bg-sand-line" />
            </div>

            <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="flex w-full items-center justify-center gap-2 rounded-xl border border-sand-line bg-white py-3 text-sm font-medium hover:bg-sand-dark">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold shadow">G</span> Masuk dengan Google
            </button>
          </form>

          <p className="mt-6 rounded-xl bg-sand-dark px-4 py-3 text-xs text-forest/70">
            Akun demo: <b>buyer@thrift.test</b> / <b>seller@thrift.test</b> • password <b>password123</b>
          </p>
          <p className="mt-4 text-center text-sm text-forest/60">
            Belum punya akun? <Link href="/register" className="font-semibold text-forest underline">Daftar</Link>
          </p>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-forest/50"><ShieldCheck size={12} /> Escrow aman — dana cair setelah konfirmasi terima</p>
          <p className="mt-2 text-center text-[11px] text-forest/40">
            Penjual? <Link href="/seller/login" className="font-semibold underline">Seller Center</Link> • Admin? <Link href="/admin/login" className="font-semibold underline">Admin Panel</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
