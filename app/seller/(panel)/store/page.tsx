import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreForm } from "@/components/seller/store-form";

export default async function SellerStorePage() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return <p className="text-sm text-slate-500">Toko tidak ditemukan.</p>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Pengaturan Toko</h1><p className="text-sm text-slate-500">Edit toko tidak perlu approve ulang (kebijakan saat ini).</p></div>
      <StoreForm initial={{ storeName: store.storeName, description: store.description ?? "", logoUrl: store.logoUrl ?? "" }} approval={store.approval} rejectReason={store.rejectReason} />
    </div>
  );
}
