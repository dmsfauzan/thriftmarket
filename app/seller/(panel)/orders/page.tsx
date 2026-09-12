import { OrdersManager } from "@/components/seller/orders-manager";
export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-extrabold tracking-tight">Pesanan</h1><p className="text-sm text-slate-500">Hanya toko milikmu. Input resi tanpa approve admin.</p></div>
      <OrdersManager />
    </div>
  );
}
