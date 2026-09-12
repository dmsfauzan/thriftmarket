"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/lib/utils";
import { Package, ArrowLeft } from "lucide-react";

const TABS = ["ALL", "PENDING_PAYMENT", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
const STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  SHIPPED: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  COMPLETED: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
};

export default function BuyerOrdersPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("ALL");
  const { data, isLoading } = useQuery({
    queryKey: ["buyer-orders"],
    queryFn: async () => (await fetch("/api/orders")).json(),
  });
  const orders = Array.isArray(data) ? data : [];
  const filtered = tab === "ALL" ? orders : orders.filter((o: any) => o.status === tab);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <Link href="/" className="rounded-full border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"><ArrowLeft size={16} /></Link>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight dark:text-white"><Package size={20} /> Pesanan Saya</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Riwayat & pelacakan semua pembelianmu</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${tab === t ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>{t}</button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Memuat pesanan...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada pesanan {tab === "ALL" ? "" : tab.toLowerCase()}.</p>
          <Link href="/products" className="mt-4 inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-emerald-600">Belanja Sekarang</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o: any) => (
            <Link key={o.id} href={`/orders/${o.orderNumber}`} className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold dark:text-white">{o.orderNumber}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[o.status] ?? ""}`}>{o.status}</span>
                <p className="ml-auto font-black dark:text-emerald-300">{formatIDR(o.totalPrice)}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.store?.storeName} • {o.courier ?? "-"} {o.waybillNumber ? `• Resi ${o.waybillNumber}` : ""} • {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
              <div className="mt-3 space-y-1.5">
                {o.items?.slice(0, 3).map((i: any) => (
                  <p key={i.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    {i.product?.images?.[0]?.url && <img src={i.product.images[0].url} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                    {i.product?.title} — {formatIDR(i.price)}
                  </p>
                ))}
                {(o.items?.length ?? 0) > 3 && <p className="text-xs text-slate-400">+{o.items.length - 3} item lainnya</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
