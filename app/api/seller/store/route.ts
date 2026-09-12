import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeller } from "@/lib/seller";
import { logActivity } from "@/lib/activity";

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
  await logActivity({
    action: "STORE_UPDATE",
    actorId: gate.userId,
    actorName: gate.user.name,
    actorRole: "SELLER",
    message: `${gate.user.name} memperbarui info toko "${store.storeName}"`,
    targetId: store.id,
    metadata: { storeName: store.storeName },
  });
  return NextResponse.json(store);
}
