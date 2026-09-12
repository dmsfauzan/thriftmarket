import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  return NextResponse.json(await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }));
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { name } = await req.json();
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const cat = await prisma.category.create({ data: { name, slug } });
  return NextResponse.json(cat);
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  await prisma.category.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
