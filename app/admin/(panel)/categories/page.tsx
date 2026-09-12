"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";

export default function AdminCategories() {
  const { data, refetch } = useQuery({ queryKey: ["admin-cats"], queryFn: async () => (await fetch("/api/admin/categories")).json() });
  const [name, setName] = useState("");
  const cats = Array.isArray(data) ? data : [];

  async function add() {
    if (!name) return;
    await fetch("/api/admin/categories", { method: "POST", body: JSON.stringify({ name }) });
    setName("");
    refetch();
  }

  async function del(id: string) {
    if (!confirm("Hapus kategori?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Kategori" sub="Manajemen kategori produk thrifting" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Tambah Baru">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kategori (misal: Watches)" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900" />
          <button onClick={add} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700"><Plus size={16} /> Simpan</button>
        </Card>
        <div className="lg:col-span-2">
          <Card title="Daftar Kategori">
            <div className="space-y-2">
              {cats.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                  <div><p className="font-bold">{c.name}</p><p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{c.slug} • {c._count.products} Produk</p></div>
                  <button onClick={() => del(c.id)} className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
