"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, PageHead } from "../cards";
import { formatIDR } from "@/lib/utils";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function AdminOrders() {
  const { data, refetch } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await fetch("/api/admin/orders")).json() });
  const orders = Array.isArray(data) ? data : [];

  async function update(id: string, status: string) {
    await fetch("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id, status }) });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHead title="Pesanan" sub="Semua transaksi marketplace" />
      <Card title="Semua Pesanan">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400 font-bold"><tr><th className="p-4">Order #</th><th>Pembeli</th><th>Toko</th><th>Total</th><th>Status</th><th className="p-4 text-center">Aksi</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-bold">{o.orderNumber}</td>
                  <td className="text-slate-500">{o.buyer.name}<br /><span className="text-[10px]">{o.buyer.email}</span></td>
                  <td className="text-slate-500">{o.store.storeName}</td>
                  <td className="font-semibold">{formatIDR(o.totalPrice)}</td>
                  <td><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${o.status === "PAID" ? "bg-emerald-100 text-emerald-700" : o.status === "SHIPPED" ? "bg-blue-100 text-blue-700" : o.status === "COMPLETED" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>{o.status}</span></td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button onClick={() => update(o.id, "COMPLETED")} className="text-xs font-bold text-emerald-600 hover:underline">Force Complete</button>
                    <button className="text-slate-400 hover:text-slate-900"><Edit size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
