"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/lib/utils";

export default function OrderDetail({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const { data: order } = useQuery({ queryKey: ["order", number], queryFn: async () => (await fetch(`/api/orders?orderNumber=${number}`)).json() });
  if (!order?.id) return <p className="p-8">Memuat...</p>;
  async function confirm() {
    await fetch("/api/orders/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) });
    location.reload();
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 dark:bg-slate-950">
      <h1 className="text-xl font-bold dark:text-white">{order.orderNumber}</h1>
      <p className="mt-1 text-sm dark:text-slate-300">Status: <b>{order.status}</b> • Kurir {order.courier} {order.waybillNumber ? `• Resi ${order.waybillNumber}` : ""}</p>
      <div className="mt-4 space-y-2">
        {order.items.map((i: any) => <div key={i.id} className="rounded-xl border border-sand-line bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{i.product.title} — {formatIDR(i.price)}</div>)}
      </div>
      <p className="mt-4 font-bold dark:text-white">Total {formatIDR(order.totalPrice)}</p>
      {order.status === "SHIPPED" && <button onClick={confirm} className="mt-4 w-full rounded-xl bg-forest py-3 font-semibold text-sand dark:bg-emerald-600 dark:text-white">Konfirmasi Terima Barang</button>}
      <p className="mt-3 text-xs text-forest/60 dark:text-slate-400">Otomatis selesai 1x24 jam setelah SHIPPED bila tidak ada konfirmasi.</p>
    </div>
  );
}
