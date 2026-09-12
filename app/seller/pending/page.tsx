"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export default function SellerPendingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-status"],
    queryFn: async () => (await fetch("/api/seller/status")).json(),
  });

  if (isLoading) return <p className="mx-auto max-w-xl p-10 text-sm text-slate-500">Memeriksa status akun...</p>;
  if (data?.error) return <p className="mx-auto max-w-xl p-10 text-sm text-red-600">Unauthorized — <Link href="/seller/login" className="underline">login lagi</Link>.</p>;

  const approved = data?.sellerStatus === "APPROVED" && data?.store?.approval === "APPROVED";
  const rejected = data?.sellerStatus === "REJECTED" || data?.store?.approval === "REJECTED";

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight">Status Toko — {data?.store?.storeName ?? "-"}</h1>
        {approved ? (
          <>
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Akun & toko disetujui. Silakan buka dashboard.</p>
            <Link href="/seller" className="mt-4 inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Buka Seller Dashboard</Link>
          </>
        ) : rejected ? (
          <>
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"><b>Ditolak.</b> Alasan: {data?.sellerRejectReason ?? data?.store?.rejectReason ?? "Tanpa alasan."}</p>
            <p className="mt-3 text-sm text-slate-500">Hubungi admin atau daftar ulang dengan nama toko yang sesuai ketentuan. Produk baru tetap bisa ditolak — tapi toko yang ditolak harus daftar baru.</p>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-4 w-full rounded-full border border-slate-200 py-2.5 text-sm font-semibold">Keluar</button>
          </>
        ) : (
          <>
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Akun & toko <b>menunggu persetujuan admin</b>. Kamu bisa login tapi belum bisa akses inventori / pesanan.</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-500">
              <li>Seller: {data?.sellerStatus} — Toko: {data?.store?.approval}</li>
              <li>Produk yang kamu upload saat PENDING akan ditahan review admin.</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Link href="/" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm">Kembali</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Keluar</button>
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">Login dibatasi hingga approve — resi tidak perlu approve.</p>
    </div>
  );
}
