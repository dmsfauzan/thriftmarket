"use client";
import Link from "next/link";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../../cards";
import { formatIDR } from "@/lib/utils";
import { ArrowLeft, Ban, CheckCircle2 } from "lucide-react";

export default function SellerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("7");
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-seller", id],
    queryFn: async () => (await fetch(`/api/admin/sellers/${id}`)).json(),
  });
  const s = data?.seller;
  const logs = data?.logs ?? [];

  async function act(action: "SUSPEND" | "UNSUSPEND") {
    if (action === "SUSPEND" && !reason.trim()) return alert("Isi alasan suspend dulu");
    const r = await fetch(`/api/admin/sellers/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason, days: Number(days) || 7 }),
    });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setReason("");
    refetch();
  }

  if (isLoading) return <p className="text-sm text-slate-400">Memuat...</p>;
  if (!s) return <p className="text-sm text-red-600">Seller tidak ditemukan.</p>;

  const suspended = s.suspendedUntil && new Date(s.suspendedUntil).getTime() > Date.now();

  return (
    <div className="space-y-6">
      <PageHead title={s.store?.storeName ?? s.name} sub={`${s.name} • ${s.email}`}>
        <Link href="/admin/sellers" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold"><ArrowLeft size={13} /> Kembali</Link>
      </PageHead>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Profil Seller">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">{s.name?.[0] ?? "S"}</span>
            <div>
              <p className="font-bold">{s.name}</p>
              <p className="text-xs text-slate-500">{s.email} • {s.phone ?? "-"}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-slate-500">Status akun</span><b>{s.sellerStatus}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Toko</span><b>{s.store?.approval}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Rating</span><b>{Number(s.store?.rating ?? 0).toFixed(1)}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Produk</span><b>{s.store?._count?.products ?? 0}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Order</span><b>{s.store?._count?.orders ?? 0}</b></li>
            <li className="flex justify-between"><span className="text-slate-500">Tergabung</span><b>{new Date(s.createdAt).toLocaleDateString("id-ID")}</b></li>
          </ul>
          {suspended ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Ditangguhkan hingga {new Date(s.suspendedUntil).toLocaleString("id-ID")}{s.suspendReason ? ` — ${s.suspendReason}` : ""}
            </div>
          ) : null}
          <div className="mt-4 space-y-2">
            {!suspended ? (
              <div className="flex gap-2">
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan suspend..." className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs" />
                <select value={days} onChange={(e) => setDays(e.target.value)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold">
                  <option value="1">1 hari</option><option value="7">7 hari</option><option value="30">30 hari</option>
                </select>
                <button onClick={() => act("SUSPEND")} className="flex items-center gap-1 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white"><Ban size={13} /> Suspend</button>
              </div>
            ) : (
              <button onClick={() => act("UNSUSPEND")} className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-2.5 text-xs font-bold text-white"><CheckCircle2 size={14} /> Aktifkan Kembali</button>
            )}
          </div>
        </Card>

        <Card title={`Aktivitas ${s.name} (${logs.length})`} action={s.store ? <Link href={`/admin/products?q=${encodeURIComponent(s.store.storeName)}`} className="text-xs font-semibold">Lihat Inventori →</Link> : undefined}>
          {logs.length === 0 ? <p className="text-sm text-slate-400">Belum ada aktivitas.</p> : (
            <div className="space-y-3">
              {logs.map((l: any) => (
                <div key={l.id} className="rounded-2xl border border-slate-100 p-3">
                  <p className="text-sm">{l.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{l.action.replace(/_/g, " ")} • {new Date(l.createdAt).toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title={`Produk (${s.store?.products?.length ?? 0})`}>
        <div className="grid gap-3 sm:grid-cols-2">
          {(s.store?.products ?? []).map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
              <img src={p.images?.[0]?.url} className="h-12 w-12 rounded-xl object-cover" alt="" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{p.title}</p><p className="text-xs text-slate-400">{p.approval} • {formatIDR(p.price)}</p></div>
              <Link href={`/products/${p.id}`} className="text-xs font-bold text-slate-500">Lihat →</Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
