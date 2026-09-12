import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, image: true, role: true,
      sellerStatus: true, sellerRejectReason: true, suspendedUntil: true, suspendReason: true, createdAt: true,
      store: {
        select: {
          id: true, storeName: true, description: true, logoUrl: true, rating: true, approval: true, rejectReason: true, createdAt: true,
          products: { take: 50, orderBy: { updatedAt: "desc" }, include: { images: true, category: true } },
          orders: { take: 20, orderBy: { createdAt: "desc" }, include: { buyer: { select: { name: true, email: true } } } },
          _count: { select: { products: true, orders: true } },
        },
      },
    },
  });
  if (!seller || seller.role !== "SELLER") return NextResponse.json({ error: "Seller tidak ditemukan" }, { status: 404 });

  const logs = await prisma.activityLog.findMany({ where: { actorId: id }, orderBy: { createdAt: "desc" }, take: 30 });

  return NextResponse.json({ seller, logs });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id } = await params;

  const { action, reason, days } = (await req.json()) as { action: "SUSPEND" | "UNSUSPEND"; reason?: string; days?: number };
  const seller = await prisma.user.findUnique({ where: { id }, include: { store: true } });
  if (!seller || seller.role !== "SELLER") return NextResponse.json({ error: "Seller tidak ditemukan" }, { status: 404 });

  const admin = (gate as { session: { user?: { id?: string; name?: string } } }).session;

  if (action === "SUSPEND") {
    const until = new Date();
    until.setDate(until.getDate() + (days && days > 0 ? days : 7));
    await prisma.user.update({ where: { id }, data: { suspendedUntil: until, suspendReason: reason?.trim() || "Pelanggaran kebijakan" } });
    await logActivity({
      action: "SELLER_REJECTED",
      actorId: admin.user?.id ?? null, actorName: admin.user?.name ?? "Admin", actorRole: "ADMIN",
      message: `Admin menangguhkan seller ${seller.name} (${seller.store?.storeName ?? "-"}) hingga ${until.toLocaleString("id-ID")}${reason ? `: ${reason.trim()}` : ""}`,
      targetId: id, metadata: { storeName: seller.store?.storeName ?? null, until: until.toISOString(), reason: reason?.trim() ?? null },
    });
    return NextResponse.json({ ok: true, suspendedUntil: until });
  }

  await prisma.user.update({ where: { id }, data: { suspendedUntil: null, suspendReason: null } });
  await logActivity({
    action: "SELLER_APPROVED",
    actorId: admin.user?.id ?? null, actorName: admin.user?.name ?? "Admin", actorRole: "ADMIN",
    message: `Admin mengaktifkan kembali seller ${seller.name} (${seller.store?.storeName ?? "-"})`,
    targetId: id, metadata: { storeName: seller.store?.storeName ?? null },
  });
  return NextResponse.json({ ok: true });
}
