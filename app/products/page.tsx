"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";

export default function CatalogPage() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [condition, setCondition] = useState(sp.get("condition") ?? "");
  const [size, setSize] = useState("");
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (min) params.set("min", min);
  if (max) params.set("max", max);
  if (condition) params.set("condition", condition);
  if (size) params.set("size", size);
  const cat = sp.get("category");
  if (cat) params.set("category", cat);
  const { data, isLoading } = useQuery({ queryKey: ["products", params.toString()], queryFn: async () => (await fetch(`/api/products?${params}`)).json() });
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 dark:bg-slate-950 md:grid-cols-[240px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-sand-line bg-white p-4 dark:border-slate-700 dark:bg-slate-900 h-fit">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / brand / gaya" className="w-full rounded-xl border border-sand-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <div className="grid grid-cols-2 gap-2">
          <input value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min Rp" type="number" className="rounded-xl border border-sand-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          <input value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max Rp" type="number" className="rounded-xl border border-sand-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full rounded-xl border border-sand-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Semua Kondisi</option>
          <option value="LIKE_NEW">Like New</option>
          <option value="GOOD">Good Condition</option>
          <option value="FAIR">Fair / Defect</option>
        </select>
        <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full rounded-xl border border-sand-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="">Semua Ukuran</option>
          {["S", "M", "L", "XL", "XXL"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </aside>
      <div>
        {isLoading ? <p className="dark:text-slate-300">Memuat...</p> : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {(data ?? []).map((p: never) => { const prod = p as { id: string }; return <ProductCard key={prod.id} p={p as never} />; })}
          </div>
        )}
      </div>
    </div>
  );
}
