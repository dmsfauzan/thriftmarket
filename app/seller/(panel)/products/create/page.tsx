"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateProduct() {
  const router = useRouter();
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", categoryId: "", condition: "GOOD",
    sizeLabel: "", sizePxL: "", brand: "", gender: "", defectDescription: "",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/products/categories").then((r) => r.json()).then(setCats); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!files || files.length === 0) return setErr("Pilih minimal 1 foto produk");
    setLoading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) fd.append("file", files[i]);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) throw new Error((await up.json()).error ?? "Upload foto gagal");
      const { urls } = await up.json();
      if (!urls?.length) throw new Error("Upload foto gagal");
      const images = urls.map((url: string, idx: number) => ({ url, isDefect: idx > 1 }));
      const r = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), images }),
      });
      if (!r.ok) throw new Error(JSON.stringify((await r.json()).error) ?? "Gagal membuat listing");
      router.push("/seller/products");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900";
  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div><h1 className="text-xl font-extrabold tracking-tight">Listing Produk Baru</h1><p className="text-sm text-slate-500">Produk baru direview admin sebelum tampil di katalog.</p></div>
      {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      <input required minLength={3} placeholder="Judul (misal: Crewneck Vintage 90s)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
      <textarea required minLength={10} placeholder="Deskripsi detail (min. 10 karakter)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} rows={4} />
      <div className="grid grid-cols-2 gap-2">
        <input required placeholder="Harga Rp" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
        <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={input}>
          <option value="">Pilih Kategori</option>
          {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={input}>
          <option value="LIKE_NEW">Like New</option>
          <option value="GOOD">Good Condition</option>
          <option value="FAIR">Fair / Defect</option>
        </select>
        <select value={form.sizeLabel} onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })} className={input}>
          <option value="">Size (S/M/L)</option>
          {["S", "M", "L", "XL", "XXL"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="PxL (70x54)" pattern="\d+x\d+" title="Format: angka x angka, mis. 70x54" value={form.sizePxL} onChange={(e) => setForm({ ...form, sizePxL: e.target.value })} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Brand (opsional)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={input} />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={input}>
          <option value="">Gender</option>
          {["Men", "Women", "Unisex"].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <input placeholder="Deskripsi Defect (wajib jika kondisi Fair)" value={form.defectDescription} onChange={(e) => setForm({ ...form, defectDescription: e.target.value })} className={input} />
      <div className="space-y-1">
        <label className="text-xs">Foto Produk (Foto 1-2: Utama, 3+: Foto Minus/Defect)</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="w-full text-sm" />
      </div>
      <button disabled={loading} className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Mengunggah..." : "Ajukan Listing ke Admin"}</button>
    </form>
  );
}
