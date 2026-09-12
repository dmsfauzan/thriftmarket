import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { requireSeller } from "@/lib/seller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, store: true, category: true } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (product.approval !== "APPROVED" || product.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Produk tidak tersedia" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireSeller();
  if ("error" in gate) return gate.error;
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.storeId !== gate.store.id) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();

  if (body.resubmit === true) {
    if (existing.approval !== "REJECTED") {
      return NextResponse.json({ error: "Hanya produk yang ditolak yang bisa diajukan ulang" }, { status: 400 });
    }
    const updated = await prisma.product.update({
      where: { id },
      data: { approval: "PENDING", approvalNote: null },
      include: { images: true },
    });
    return NextResponse.json(updated);
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      condition: parsed.data.condition,
      sizePxL: parsed.data.sizePxL || null,
      sizeLabel: parsed.data.sizeLabel || null,
      brand: parsed.data.brand || null,
      gender: parsed.data.gender || null,
      defectDescription: parsed.data.defectDescription || null,
    },
    include: { images: true },
  });
  return NextResponse.json(updated);
}
