import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSeller } from "@/lib/seller";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const gate = await requireApprovedSeller();
  if ("error" in gate) return gate.error;
  const { rows } = await req.json() as { rows: { title: string; description: string; price: number; categoryId: string; condition?: string; weight?: number; sku?: string }[] };
  if (!Array.isArray(rows) || !rows.length) return NextResponse.json({ error: "CSV kosong" }, { status: 400 });
  if (rows.length > 50) return NextResponse.json({ error: "Maksimal 50 baris" }, { status: 400 });

  const created = [];
  for (const r of rows) {
    if (!r.title || !r.description || !r.price || !r.categoryId) continue;
    const p = await prisma.product.create({
      data: {
        storeId: gate.store.id,
        categoryId: r.categoryId,
        title: String(r.title).slice(0, 255),
        description: String(r.description),
        price: Number(r.price),
        condition: (r.condition as "LIKE_NEW" | "GOOD" | "FAIR") || "GOOD",
        weight: r.weight ?? 600,
        sku: r.sku || null,
        approval: "PENDING",
        images: { create: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", isDefect: false }] },
      },
    });
    created.push(p.id);
  }
  return NextResponse.json({ created: created.length });
}
