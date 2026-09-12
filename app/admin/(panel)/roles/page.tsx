import { Card, PageHead } from "../cards";
export default function AdminPages({ searchParams }: any) {
  return (
    <div className="space-y-6">
      <PageHead title="Metronic Demo Page" sub="Placeholder untuk menyesuaikan struktur Demo 6" />
      <Card title="Coming Soon"><p className="py-20 text-center text-sm text-slate-400">Halaman ini dimapping ke struktur Demo 6 — tambahkan konten custommu di sini.</p></Card>
    </div>
  );
}
