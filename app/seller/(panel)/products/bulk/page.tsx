"use client";
import { useState } from "react";

export default function BulkUpload() {
  const [csv, setCsv] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return setMsg("Format: title,description,price,categoryId,condition,weight,sku");
    const rows = lines.slice(1).map((l) => {
      const [title, description, price, categoryId, condition, weight, sku] = l.split(",").map((s) => s.trim());
      return { title, description, price: Number(price), categoryId, condition, weight: Number(weight) || 600, sku };
    });
    const r = await fetch("/api/seller/products/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error ?? "Gagal");
    setMsg(`Berhasil membuat ${j.created} listing (PENDING review admin).`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-extrabold">Upload Massal via CSV</h1>
      <p className="text-sm text-slate-500">Header wajib: title,description,price,categoryId,condition,weight,sku</p>
      {msg && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm">{msg}</p>}
      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={10} placeholder="title,description,price,categoryId,condition,weight,sku&#10;Crewneck Vintage,Deskripsi panjang minimal 10 karakter,89000,catId,GOOD,700,SKU-001" className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs" />
      <button onClick={submit} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white">Upload {csv ? csv.trim().split("\n").length - 1 : 0} Baris</button>
    </div>
  );
}
