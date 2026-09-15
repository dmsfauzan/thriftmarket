import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/product-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id }, include: { images: true, store: true } });
  if (!p) return { title: "Produk tidak ditemukan" };
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: `${p.title} — ${p.store.storeName}`,
    description: p.description.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.description.slice(0, 160),
      images: p.images[0]?.url ? [p.images[0].url] : [],
      url: `${base}/products/${p.id}`,
      type: "website",
    },
  };
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, store: true, category: true } });
  if (!product) notFound();
  const related = await prisma.product.findMany({
    where: { id: { not: id }, status: "AVAILABLE", approval: "APPROVED", OR: [{ categoryId: product.categoryId }, { storeId: product.storeId }] },
    include: { images: true, store: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  return <ProductDetail product={JSON.parse(JSON.stringify({ ...product, related }))} />;
}
