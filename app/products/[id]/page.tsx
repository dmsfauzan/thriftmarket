import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/product-detail";

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, store: true, category: true } });
  if (!product) notFound();
  return <ProductDetail product={JSON.parse(JSON.stringify(product))} />;
}
