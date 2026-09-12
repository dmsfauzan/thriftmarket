import { Card, PageHead } from "../cards";
export default function AdminStores() {
  return (
    <div className="space-y-6">
      <PageHead title="Toko & Storefront" sub="Semua toko terdaftar di platform" />
      <Card title="Daftar Store"><p className="py-10 text-center text-sm text-slate-400">Data toko diambil dari relasi User → Store (seller@thrift.test). Kelola lewat menu Users & Roles.</p></Card>
    </div>
  );
}
