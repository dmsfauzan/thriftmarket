"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ArrowLeft, Trash2, Star, Plus } from "lucide-react";
import { AddressForm } from "@/components/address-form";
import { Modal } from "@/components/ui/modal";

export default function AddressesPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await fetch("/api/addresses")).json(),
  });
  const addresses = Array.isArray(data) ? data : [];

  async function setPrimary(id: string) {
    await fetch("/api/addresses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    refetch();
  }

  async function remove(id: string) {
    if (!confirm("Hapus alamat ini?")) return;
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight dark:text-white"><MapPin size={20} /> Alamat Pengiriman</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Kelola alamat untuk checkout & Midtrans</p>
          </div>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-emerald-600"><Plus size={15} /> Tambah Alamat</button>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Alamat">
        <AddressForm onSaved={() => { setAddOpen(false); refetch(); }} />
      </Modal>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Memuat alamat...</p>
        ) : addresses.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Belum ada alamat. Tambahkan lewat form di atas.</p>
        ) : (
          addresses.map((a: any) => (
            <div key={a.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="flex items-center gap-2 text-sm font-bold dark:text-white">
                    {a.label}
                    {a.isPrimary && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200"><Star size={10} /> UTAMA</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.street}, {a.city}, {a.province} {a.postalCode}</p>
                </div>
                <button onClick={() => remove(a.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" title="Hapus"><Trash2 size={16} /></button>
              </div>
              {!a.isPrimary && (
                <button onClick={() => setPrimary(a.id)} className="mt-3 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Jadikan Utama</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
