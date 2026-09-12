import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { requireApprovedSeller } from "@/lib/seller";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const min = searchParams.get("min") ? Number(searchParams.get("min")) : undefined;
  const max = searchParams.get("max") ? Number(searchParams.get("max")) : undefined;
  const condition = searchParams.get("condition") as "LIKE_NEW" | "GOOD" | "FAIR" | null;
  const size = searchParams.get("size") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const status = searchParams.get("status") as string | null;
  const approval = searchParams.get("approval") as string | null;
  const take = Math.min(Number(searchParams.get("take") ?? 24), 48);
  const where: Record<string, unknown> = {};
  if (status) (where as Record<string, string>).status = status;
  else (where as Record<string, string>).status = "AVAILABLE";
  if (approval) (where as Record<string, string>).approval = approval;
  else (where as Record<string, string>).approval = "APPROVED";
  if (q) (where as Record<string, unknown>).OR = [{ title: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }];
  if (min !== undefined || max !== undefined) (where as Record<string, unknown>).price = { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) };
  if (condition) (where as Record<string, string>).condition = condition;
  if (size) (where as Record<string, string>).sizeLabel = size;
  if (category) (where as Record<string, string>).categoryId = category;
  const products = await prisma.product.findMany({ where: where as never, include: { images: true, category: true, store: true }, orderBy: { createdAt: "desc" }, take });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();

  if (session?.user && (session.user as { role?: string } | undefined)?.role === "ADMIN") {
    const userId = (session.user as { id: string }).id;
    let storeId: string | null = null;
    if (body.storeId) {
      const s = await prisma.store.findUnique({ where: { id: body.storeId } });
      storeId = s?.id ?? null;
    }
    if (!storeId) {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.id ?? null;
    }
    if (!storeId) storeId = (await prisma.store.findFirst())?.id ?? null;
    if (!storeId) return NextResponse.json({ error: "Store belum dibuat" }, { status: 400 });
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const product = await prisma.product.create({
      data: {
        storeId,
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
        approval: "APPROVED",
        images: { create: parsed.data.images.map((i) => ({ url: i.url, isDefect: i.isDefect })) },
      },
      include: { images: true },
    });
    return NextResponse.json(product, { status: 201 });
  }

  const gate = await requireApprovedSeller();
  if ("error" in gate) return gate.error;

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = await prisma.product.create({
    data: {
      storeId: gate.store.id,
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
      approval: "PENDING",
      approvalNote: null,
      images: { create: parsed.data.images.map((i) => ({ url: i.url, isDefect: i.isDefect })) },
    },
    include: { images: true },
  });
  await logActivity({
    action: "PRODUCT_CREATE",
    actorId: gate.userId,
    actorName: gate.user.name,
    actorRole: "SELLER",
    message: `${gate.user.name} mengunggah produk "${product.title}" (Rp${product.price.toLocaleString("id-ID")}) — menunggu approval`,
    targetId: product.id,
    metadata: { storeName: gate.store.storeName, title: product.title, price: product.price },
  }).catch(() => null);
  return NextResponse.json(product, { status: 201 });
}
