"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, PageHead } from "../cards";
import { Search, Activity } from "lucide-react";

const ACTIONS = ["ALL", "SELLER_REGISTER", "SELLER_APPROVED", "SELLER_REJECTED", "PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_RESUBMIT", "PRODUCT_APPROVED", "PRODUCT_REJECTED", "ORDER_SHIPPED", "STORE_UPDATE"];

const ACTION_STYLE: Record<string, string> = {
  SELLER_REGISTER: "bg-blue-100 text-blue-800",
  SELLER_APPROVED: "bg-emerald-100 text-emerald-800",
  SELLER_REJECTED: "bg-red-100 text-red-800",
  PRODUCT_CREATE: "bg-amber-100 text-amber-800",
  PRODUCT_UPDATE: "bg-slate-200 text-slate-700",
  PRODUCT_RESUBMIT: "bg-amber-100 text-amber-800",
  PRODUCT_APPROVED: "bg-emerald-100 text-emerald-800",
  PRODUCT_REJECTED: "bg-red-100 text-red-800",
  ORDER_SHIPPED: "bg-purple-100 text-purple-800",
  STORE_UPDATE: "bg-slate-200 text-slate-700",
};

export default function AdminActivity() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState("ALL");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", q, action],
    queryFn: async () => (await fetch(`/api/admin/activity?q=${encodeURIComponent(q)}&action=${action}`)).json(),
  });
  const logs = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <PageHead title="Aktivitas Seller" sub="Pantau semua aksi seller secara real-time">
        <div className="flex gap-2">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari seller / toko / produk..." className="rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-slate-900" /></div>
          <Link2 href="/admin/sellers" label="Kelola Sellers" />
        </div>
      </PageHead>
      <div className="flex flex-wrap gap-1.5 rounded-3xl border border-slate-200 bg-white p-2">
        {ACTIONS.map((a) => (
          <button key={a} onClick={() => setAction(a)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${action === a ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{a.replace(/_/g, " ")}</button>
        ))}
      </div>
      <Card title={`Log Aktivitas (${logs.length})`}>
        {isLoading ? <p className="text-sm text-slate-400">Memuat...</p> : logs.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="relative space-y-0 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-slate-200">
            {logs.map((l: any) => (
              <div key={l.id} className="relative pb-5 last:pb-0">
                <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-slate-200"><Activity size={10} className="text-slate-400" /></span>
                <p className="text-sm text-slate-700">
                  <b>{l.actorName ?? "Sistem"}</b> <span className="text-xs text-slate-400">({l.actorRole ?? "?"})</span> — {l.message}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ACTION_STYLE[l.action] ?? "bg-slate-100 text-slate-600"}`}>{l.action.replace(/_/g, " ")}</span>
                  <span className="text-[11px] text-slate-400">{new Date(l.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Link2({ href, label }: { href: string; label: string }) {
  return <a href={href} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">{label}</a>;
}
