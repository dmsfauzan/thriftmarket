import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const { productId, title, price } = (await req.json()) as { productId: string; title?: string; price?: number };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  if (title !== undefined && title.trim().length < 3) return NextResponse.json({ error: "Judul minimal 3 karakter" }, { status: 400 });
  if (price !== undefined && (!Number.isInteger(price) || price <= 0)) return NextResponse.json({ error: "Harga harus bilangan bulat positif" }, { status: 400 });

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(price !== undefined ? { price } : {}),
    },
    include: { store: true },
  });

  const admin = (gate as { session: { user?: { id?: string; name?: string } } }).session;
  await logActivity({
    action: "PRODUCT_UPDATE",
    actorId: admin.user?.id ?? null, actorName: admin.user?.name ?? "Admin", actorRole: "ADMIN",
    message: `Admin mengedit produk "${product.title}" (${product.store?.storeName ?? "-"})`,
    targetId: productId,
    metadata: { title: product.title, price: product.price },
  });
  return NextResponse.json({ ok: true, product });
}
