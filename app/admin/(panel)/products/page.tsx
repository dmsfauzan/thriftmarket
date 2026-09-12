"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { formatIDR, conditionLabel } from "@/lib/utils";
import { Trash2, Search } from "lucide-react";
import { useState } from "react";

export default function AdminProducts() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("PENDING");
  const [note, setNote] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkNote, setBulkNote] = useState("");
  const [edit, setEdit] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const { data, refetch } = useQuery({
    queryKey: ["admin-products", q, tab],
    queryFn: async () => (await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&approval=${tab}`)).json(),
  });
  const products = Array.isArray(data) ? data : [];
  const selCount = Object.values(selected).filter(Boolean).length;

  function toggleAll(v: boolean) {
    const m: Record<string, boolean> = {};
    products.forEach((p: any) => (m[p.id] = v));
    setSelected(m);
  }
  function copyToEdit(p: any) {
    setEdit(p);
    setEditTitle(p.title);
    setEditPrice(String(p.price));
  }
  async function saveEdit() {
    const r = await fetch(`/api/admin/products/detail`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: edit.id, title: editTitle.trim(), price: Number(editPrice) }),
    });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setShowEdit(false);
    refetch();
  }

  async function del(id: string) {
    if (!confirm("Hapus produk?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    refetch();
  }

  async function act(id: string, action: "APPROVE" | "REJECT") {
    if (action === "REJECT" && !note[id]?.trim()) return alert("Isi catatan penolakan dulu");
    const r = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, action, note: note[id]?.trim() }),
    });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setNote((s) => ({ ...s, [id]: "" }));
    refetch();
  }

  async function bulk(action: "APPROVE" | "REJECT") {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return alert("Pilih minimal 1 produk");
    if (action === "REJECT" && !bulkNote.trim()) return alert("Isi catatan bulk dulu");
    const r = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids, action, note: bulkNote.trim() }),
    });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setSelected({});
    setBulkNote("");
    refetch();
  }

  function exportCsv() {
    const rows = [["Produk", "Toko", "Harga", "Kondisi", "Status", "Approval"], ...products.map((p: any) => [p.title, p.store?.storeName, p.price, p.condition, p.status, p.approval])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${tab.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHead title="Inventori" sub="Moderasi produk baru — approve agar tampil di katalog">
        <div className="flex gap-2 items-center">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari produk..." className="rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-slate-900" /></div>
          <button onClick={exportCsv} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold">Export CSV</button>
        </div>
      </PageHead>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex w-fit gap-1 rounded-full border border-slate-200 bg-white p-1">
          {["PENDING", "APPROVED", "REJECTED"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${tab === t ? "bg-slate-900 text-white" : "text-slate-500"}`}>{t}</button>
          ))}
        </div>
        {selCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-white">
            <span className="text-xs font-bold">{selCount} terpilih</span>
            <button onClick={() => bulk("APPROVE")} className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold">Bulk Approve</button>
            <input value={bulkNote} onChange={(e) => setBulkNote(e.target.value)} placeholder="Catatan reject" className="w-28 rounded-full px-3 py-1 text-xs text-slate-900" />
            <button onClick={() => bulk("REJECT")} className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold">Bulk Reject</button>
            <button onClick={() => setSelected({})} className="text-[11px] font-bold text-slate-300">Batal</button>
          </div>
        )}
      </div>
      <Card title={`${tab} (${products.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400 font-bold"><tr><th className="p-4"><label className="flex items-center gap-2"><input type="checkbox" checked={products.length > 0 && selCount === products.length} onChange={(e) => toggleAll(e.target.checked)} />Produk</label></th><th>Toko</th><th>Kategori</th><th className="p-2">Harga</th><th>Kondisi</th><th>Status</th><th className="p-4">Aksi</th></tr></thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4"><div className="flex items-center gap-3"><input type="checkbox" checked={!!selected[p.id]} onChange={(e) => setSelected({ ...selected, [p.id]: e.target.checked })} /><img src={p.images[0]?.url} className="h-10 w-10 rounded-lg object-cover" alt="" /><span className="font-semibold">{p.title}</span></div>{p.approvalNote ? <span className="mt-1 block text-[11px] text-red-600">Note: {p.approvalNote}</span> : null}</td>
                  <td className="text-slate-500">{p.store?.storeName}</td>
                  <td><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{p.category?.name ?? "-"}</span></td>
                  <td className="font-semibold">{formatIDR(p.price)}</td>
                  <td><span className="text-xs text-slate-500">{conditionLabel(p.condition)}</span></td>
                  <td><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${p.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : p.status === "BOOKED" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}>{p.status}</span></td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1 items-center">
                        {(tab === "PENDING" || tab === "REJECTED") && <button onClick={() => act(p.id, "APPROVE")} className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white">Approve</button>}
                        {tab !== "REJECTED" && <button onClick={() => act(p.id, "REJECT")} className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-bold text-red-600">Reject</button>}
                        <button className="rounded-full border border-slate-200 px-2 py-1 text-[11px] font-bold" onClick={() => { copyToEdit(p); setShowEdit(true); }}>Edit</button>
                        <button onClick={() => del(p.id)} className="ml-1 text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                      {tab !== "APPROVED" && <input value={note[p.id] ?? ""} onChange={(e) => setNote({ ...note, [p.id]: e.target.value })} placeholder="Catatan (wajib jika reject)" className="w-40 rounded-full border border-slate-200 px-3 py-1 text-xs" />}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">Tidak ada produk {tab.toLowerCase()}.</td></tr>}
            </tbody>
          </table>
          {showEdit && edit && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold">Edit — {edit.title}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Judul" className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Harga" className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveEdit} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Simpan</button>
                <button onClick={() => setShowEdit(false)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold">Batal</button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
