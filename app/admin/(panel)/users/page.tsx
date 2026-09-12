"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { Shield, Trash2, UserCog } from "lucide-react";

export default function AdminUsers() {
  const { data, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await fetch("/api/admin/users")).json() });
  const users = Array.isArray(data) ? data : [];

  async function setRole(id: string, role: string) {
    await fetch("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id, role }) });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Pengguna" sub="Kelola peran dan akses user" />
      <Card title="Daftar Pengguna">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400 font-bold"><tr><th className="p-4">User</th><th>Role</th><th>Store</th><th>Orders</th><th>Reviews</th><th className="p-4 text-center">Aksi</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4 flex items-center gap-3"><img src={u.image ?? `https://ui-avatars.com/api/?name=${u.name}`} className="h-10 w-10 rounded-full border border-slate-200" alt="" /><div><p className="font-bold">{u.name}</p><p className="text-[11px] text-slate-500">{u.email}</p></div></td>
                  <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "SELLER" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{u.role}</span></td>
                  <td className="text-slate-500">{u.store?.storeName ?? "-"}</td>
                  <td className="font-semibold">{u._count.orders}</td>
                  <td className="font-semibold">{u._count.reviews}</td>
                  <td className="p-4 flex items-center justify-center gap-3">
                    <select value={u.role} onChange={e => setRole(u.id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-slate-900"><option value="BUYER">BUYER</option><option value="SELLER">SELLER</option><option value="ADMIN">ADMIN</option></select>
                    <button className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
