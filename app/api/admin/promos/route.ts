import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  return NextResponse.json(await prisma.promo.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { code, label, discount, expiresAt } = await req.json();
  if (!code?.trim() || code.trim().length < 3) return NextResponse.json({ error: "Kode minimal 3 karakter" }, { status: 400 });
  if (!Number.isInteger(discount) || discount <= 0 || discount > 90) return NextResponse.json({ error: "Diskon harus 1-90%" }, { status: 400 });
  try {
    const promo = await prisma.promo.create({
      data: {
        code: code.trim().toUpperCase(),
        label: label?.trim() || null,
        discount,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: "Kode sudah dipakai" }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { id } = await req.json();
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await prisma.promo.update({ where: { id }, data: { isActive: !promo.isActive } }));
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  await prisma.promo.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
