"use client";
import { useQuery } from "@tanstack/react-query";

export default function SellerDisputes() {
  const { data } = useQuery({ queryKey: ["seller-disputes"], queryFn: async () => (await fetch("/api/disputes")).json() });
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Komplain Masuk</h1><p className="text-sm text-slate-500">Respon cepat agar escrow tidak direfund admin</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        {rows.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">Tidak ada komplain.</p> : (
          <div className="space-y-3">
            {rows.map((d: any) => (
              <div key={d.id} className="rounded-2xl border border-slate-100 p-4 text-sm">
                <p className="font-bold">{d.order?.orderNumber} — <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px]">{d.status}</span></p>
                <p className="mt-1">{d.reason}</p>
                {d.evidenceUrl && <a href={d.evidenceUrl} target="_blank" className="mt-2 block text-xs font-bold text-blue-600 underline">Lihat Bukti Buyer →</a>}
                <p className="text-xs text-slate-400">{d.buyer?.email} • {new Date(d.createdAt).toLocaleString("id-ID")}</p>
                {d.resolution && <p className="mt-1 text-xs">Resolusi admin: {d.resolution}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
