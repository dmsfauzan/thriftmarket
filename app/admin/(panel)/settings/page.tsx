import { Card, PageHead } from "../cards";
export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <PageHead title="Settings" sub="Pengaturan platform ThriftMarket" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Public Profile">
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900 p-6 text-white"><p className="font-bold">Metronic SaaS Settings</p><p className="text-sm text-slate-400">Konfigurasi global aplikasi marketplace.</p></div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Site Name</label><input disabled value="ThriftMarket SaaS" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ongkir Flat</label><input disabled value="Rp15.000 (JNE/JNT/SiCepat)" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" /></div>
            </div>
          </div>
        </Card>
        <Card title="Integrations">
          <div className="space-y-3">
            {["Midtrans Snap", "RajaOngkir API", "Cloudinary Storage"].map(x => (
              <div key={x} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"><span className="text-sm font-bold">{x}</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Connected</span></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
