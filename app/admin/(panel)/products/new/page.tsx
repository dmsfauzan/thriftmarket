"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHead, Card } from "../../cards";

export default function AdminCreateProduct() {
  const router = useRouter();
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", price: "", categoryId: "", condition: "GOOD", sizeLabel: "", sizePxL: "", brand: "", defectDescription: "", storeId: "" });
  const [stores, setStores] = useState<any[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  useEffect(() => {
    fetch("/api/products/categories").then(r => r.json()).then(setCats);
    fetch("/api/admin/users").then(r => r.json()).then((u) => setStores(Array.isArray(u) ? u.filter((x: any) => x.store) : []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!files) return alert("Pilih minimal 1 foto");
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) fd.append("file", files[i]);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    const { urls } = await up.json();
    const images = (urls ?? []).map((url: string, idx: number) => ({ url, isDefect: idx > 1 }));
    const r = await fetch("/api/products", { method: "POST", body: JSON.stringify({ ...form, images, storeId: form.storeId || undefined }) });
    if (r.ok) router.push("/admin/products");
    else alert((await r.json()).error ?? "Gagal");
  }

  return (
    <div className="space-y-6">
      <PageHead title="Tambah Produk" sub="Buat listing baru (admin)" />
      <Card title="Form Listing">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <input placeholder="Judul" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm md:col-span-2" />
          <textarea placeholder="Deskripsi" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm md:col-span-2" />
          <input placeholder="Harga" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm" />
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"><option value="">Kategori</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"><option value="LIKE_NEW">Like New</option><option value="GOOD">Good</option><option value="FAIR">Fair/Defect</option></select>
          <input placeholder="PxL (mis. 70x54)" value={form.sizePxL} onChange={e => setForm({ ...form, sizePxL: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm" />
          <input placeholder="Deskripsi defect" value={form.defectDescription} onChange={e => setForm({ ...form, defectDescription: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm md:col-span-2" />
          <input type="file" multiple onChange={e => setFiles(e.target.files)} className="text-sm md:col-span-2" />
          <button className="rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white md:col-span-2">Tayangkan</button>
        </form>
      </Card>
    </div>
  );
}
