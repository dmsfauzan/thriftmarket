import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const settings = await prisma.siteSetting.findMany();
  return NextResponse.json(Object.fromEntries(settings.map((s) => [s.key, s.value])));
}

export async function PUT(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const body = await req.json() as Record<string, string>;
  const allowed = ["siteName", "shippingFee", "feePercent", "supportEmail"] as const;
  const rows = allowed
    .filter((k) => body[k] !== undefined)
    .map((k) => prisma.siteSetting.upsert({ where: { key: k }, update: { value: String(body[k]) }, create: { key: k, value: String(body[k]) } }));
  await prisma.$transaction(rows);
  return NextResponse.json({ ok: true });
}
