import { Card, PageHead } from "../cards";
export default function AdminReviews() {
  return (
    <div className="space-y-6">
      <PageHead title="Ulasan" sub="Monitoring rating dan feedback pembeli" />
      <Card title="Customer Reviews"><p className="py-20 text-center text-sm text-slate-400">Belum ada ulasan yang masuk dari pesanan COMPLETED.</p></Card>
    </div>
  );
}
