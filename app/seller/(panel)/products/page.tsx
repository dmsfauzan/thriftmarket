import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatIDR, conditionLabel } from "@/lib/utils";
import { ResubmitButton } from "@/components/seller/resubmit-button";

export default async function InventoryPage() {
  const session = await auth();
  const userId = (session?.user as { id: string })?.id;
  const store = userId ? await prisma.store.findUnique({ where: { userId } }) : null;
  const products = store ? await prisma.product.findMany({ where: { storeId: store.id }, include: { images: true }, orderBy: { updatedAt: "desc" } }) : [];
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Inventori • {store?.storeName}</h1><p className="text-sm text-slate-500">Produk baru menunggu review admin. Produk yang ditolak bisa diedit & diajukan ulang.</p></div>
      <div className="overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase font-bold text-slate-400"><tr><th className="p-4">Produk</th><th>Harga</th><th>PxL</th><th>Kondisi</th><th>Approval</th><th>Status</th><th className="p-4">Aksi</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4"><div className="flex items-center gap-3"><img src={p.images[0]?.url} className="h-10 w-10 rounded-xl object-cover" alt="" /><span className="font-semibold">{p.title}</span></div>{p.approvalNote ? <span className="mt-1 block text-[11px] text-red-600">Alasan admin: {p.approvalNote}</span> : null}</td>
                <td className="font-semibold">{formatIDR(p.price)}</td>
                <td className="text-slate-500">{p.sizePxL ?? "-"}</td>
                <td><span className="text-xs text-slate-500">{conditionLabel(p.condition)}</span></td>
                <td><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${p.approval === "APPROVED" ? "bg-emerald-100 text-emerald-700" : p.approval === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{p.approval}</span></td>
                <td><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${p.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : p.status === "BOOKED" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}>{p.status}</span></td>
                <td className="p-4">{p.approval === "REJECTED" ? <ResubmitButton id={p.id} /> : <span className="text-xs text-slate-300">—</span>}</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">Belum ada produk.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
