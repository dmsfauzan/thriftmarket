import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller";

export async function PATCH(req: NextRequest) {
  const gate = await requireSeller();
  if ("error" in gate) return gate.error;

  const { storeName, description, logoUrl } = await req.json();
  if (!storeName?.trim() || storeName.trim().length < 3) {
    return NextResponse.json({ error: "Nama toko minimal 3 karakter" }, { status: 400 });
  }

  const store = await prisma.store.update({
    where: { id: gate.store.id },
    data: {
      storeName: storeName.trim(),
      description: description?.trim() || null,
      logoUrl: logoUrl?.trim() || null,
    },
  });
  return NextResponse.json(store);
}
