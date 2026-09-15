import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json([]);
  const product = await prisma.product.findUnique({ where: { id }, select: { categoryId: true, storeId: true } });
  if (!product) return NextResponse.json([]);
  const related = await prisma.product.findMany({
    where: {
      id: { not: id },
      status: "AVAILABLE",
      approval: "APPROVED",
      OR: [{ categoryId: product.categoryId }, { storeId: product.storeId }],
    },
    include: { images: true, store: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(related);
}
