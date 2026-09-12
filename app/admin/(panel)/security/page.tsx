import { prisma } from "@/lib/prisma";
import { Card, PageHead } from "../cards";

export default async function AdminSecurity() {
  const logs = await prisma.activityLog.findMany({
    where: { actorRole: "ADMIN" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return (
    <div className="space-y-6">
      <PageHead title="Security Log" sub="30 aktivitas admin terbaru dari ActivityLog" />
      <Card title="Recent Admin Logs">
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="rounded-xl border border-slate-100 bg-white p-3 font-mono text-xs">
              <b>{l.actorName}</b> — {l.message} <span className="text-slate-400">• {new Date(l.createdAt).toLocaleString("id-ID")}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Belum ada log admin.</p>}
        </div>
      </Card>
    </div>
  );
}
