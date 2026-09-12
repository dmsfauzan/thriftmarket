"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
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
    if (role !== "ADMIN") {
      await signOut({ redirect: false });
      return setErr("Akses ditolak: akun ini bukan admin.");
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">M</span>
            <div className="leading-tight">
              <p className="font-bold">MetronicCloud</p>
              <p className="text-[11px] text-slate-400">Demo 6 • Admin</p>
            </div>
            <span className="ml-auto rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">PRO</span>
          </div>
          <h1 className="mt-6 text-xl font-extrabold tracking-tight">Admin Sign In</h1>
          <p className="mt-1 text-xs text-slate-500">Khusus administrator. Login dengan kredensial admin.</p>

          {err && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" type="email" required className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-900" />
            </div>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="Password admin" required className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-slate-900" />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button disabled={loading} className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
              {loading ? "Memproses..." : "Sign In"}
            </button>
          </form>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck size={12} /> Area terbatas — aktivitas login tercatat</p>
        </div>
        <Link href="/" className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={14} /> Kembali ke Toko</Link>
      </div>
    </div>
  );
}
