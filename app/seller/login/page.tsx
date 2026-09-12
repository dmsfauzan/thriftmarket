"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Store, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SellerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const registered = sp.get("registered");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await signIn("credentials", { email, password, redirect: false });
    if (r?.error) {
      setLoading(false);
      return setErr("Email atau password salah.");
    }
    const s = await fetch("/api/seller/status").then((res) => res.json()).catch(() => null);
    setLoading(false);
    if (!s || s.error) {
      await signOut({ redirect: false });
      return setErr("Gagal memeriksa status toko.");
    }
    if (s.role !== "SELLER") {
      await signOut({ redirect: false });
      return setErr("Akun ini bukan penjual. Buyer login di /login, admin di /admin/login.");
    }
    const storeApproval = s.store?.approval as string | undefined;
    const sellerStatus = s.sellerStatus as string | undefined;
    if (sellerStatus !== "APPROVED" || storeApproval !== "APPROVED") {
      router.push("/seller/pending");
      return;
    }
    router.push("/seller");
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col">
        <Link href="/" className="text-xl font-bold tracking-tight">ThriftMarket — Seller Center</Link>
        <div className="flex flex-1 flex-col justify-center gap-5">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium"><Store size={14} /> Khusus Penjual Ter-verifikasi</p>
          <h1 className="max-w-md text-3xl font-bold leading-tight">Kelola toko &<br />pesanan masuk.</h1>
          <p className="max-w-md text-sm text-slate-400">Masuk dengan kredensial seller. Jika akunmu masih PENDING, kamu akan diarahkan ke halaman status persetujuan.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-sand px-4 py-10">
        <div className="w-full max-w-sm">
          {registered && <p className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"><CheckCircle2 size={16} className="mt-0.5 shrink-0" />Pendaftaran terkirim! Akun & toko menunggu approval admin. Silakan login untuk cek status.</p>}
          <h2 className="text-2xl font-bold text-forest">Masuk Seller</h2>
          <p className="mt-1 text-sm text-forest/60">Credentials only. Tanpa Google.</p>
          {err && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="relative"><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@email.com" type="email" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-3 text-sm" /></div>
            <div className="relative"><Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/40" /><input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="Password" required className="w-full rounded-xl border border-sand-line bg-white py-2.5 pl-9 pr-9 text-sm" /><button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/50">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            <button disabled={loading} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Memproses..." : "Masuk"}</button>
          </form>
          <p className="mt-4 text-center text-sm text-forest/60">Belum punya toko? <Link href="/seller/register" className="font-semibold underline">Daftar Seller</Link></p>
          <Link href="/" className="mt-3 flex items-center justify-center gap-1.5 text-sm text-forest/50"><ArrowLeft size={14} /> Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
