"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { Search, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [reason, setReason] = useState<Record<string, string>>({});
  const { data, refetch } = useQuery({ queryKey: ["admin-users", q], queryFn: async () => (await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`)).json() });
  const users = Array.isArray(data) ? data : [];

  async function setRole(id: string, role: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
    refetch();
  }
  async function suspend(id: string) {
    if (!reason[id]?.trim()) return alert("Isi alasan suspend dulu");
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, suspendDays: 7, reason: reason[id].trim() }) });
    setReason((s) => ({ ...s, [id]: "" }));
    refetch();
  }
  async function unsuspend(id: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, unsuspend: true }) });
    refetch();
  }
  async function del(id: string) {
    if (!confirm("Hapus user ini?")) return;
    const r = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Pengguna" sub="Kelola role, suspend, dan hapus user">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / email..." className="rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-slate-900" /></div>
      </PageHead>
      <Card title={`Daftar Pengguna (${users.length})`}>
        <div className="space-y-3">
          {users.map((u: any) => {
            const suspended = u.suspendedUntil && new Date(u.suspendedUntil).getTime() > Date.now();
            return (
              <div key={u.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <img src={u.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name ?? "U")}`} className="h-10 w-10 rounded-full border border-slate-200 object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-bold">{u.name} <span className="text-xs font-normal text-slate-400">{u.email}</span> {suspended && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">SUSPENDED</span>}</p>
                    <p className="text-xs text-slate-500">{u.store?.storeName ?? "-"} • {u._count.orders} order • {u._count.reviews} ulasan</p>
                  </div>
                  <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-slate-900"><option value="BUYER">BUYER</option><option value="SELLER">SELLER</option><option value="ADMIN">ADMIN</option></select>
                  <button onClick={() => del(u.id)} className="text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {suspended ? (
                    <button onClick={() => unsuspend(u.id)} className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white"><CheckCircle2 size={12} /> Aktifkan</button>
                  ) : (
                    <>
                      <input value={reason[u.id] ?? ""} onChange={(e) => setReason({ ...reason, [u.id]: e.target.value })} placeholder="Alasan suspend..." className="flex-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs" />
                      <button onClick={() => suspend(u.id)} className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white"><Ban size={12} /> Suspend 7 hari</button>
                    </>
                  )}
                  {suspended && <span className="text-[11px] text-red-600">s/d {new Date(u.suspendedUntil).toLocaleString("id-ID")} {u.suspendReason ? `— ${u.suspendReason}` : ""}</span>}
                </div>
              </div>
            );
          })}
          {users.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Tidak ada user.</p>}
        </div>
      </Card>
    </div>
  );
}
