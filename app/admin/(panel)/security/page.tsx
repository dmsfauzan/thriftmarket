import { Card, PageHead } from "../cards";
export default function AdminSecurity() {
  return (
    <div className="space-y-6">
      <PageHead title="Security Log" sub="Pemantauan akses dan log keamanan" />
      <Card title="Recent Logs">
        <div className="space-y-3">
          {["Login admin@thrift.test — success", "User buyer@thrift.test akses checkout", "Payload webhook Midtrans settlement"].map(l => (
            <div key={l} className="rounded-xl border border-slate-100 bg-white p-4 text-sm font-mono text-xs">{l}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
