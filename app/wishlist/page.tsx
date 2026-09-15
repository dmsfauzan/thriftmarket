"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";

export default function WishlistPage() {
  const { data } = useQuery({ queryKey: ["wishlist"], queryFn: async () => (await fetch("/api/wishlist")).json() });
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 dark:bg-slate-950">
      <h1 className="text-xl font-bold dark:text-white">Wishlist ({items.length})</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((w: any) => <ProductCard key={w.id} p={w.product} />)}
      </div>
      {items.length === 0 && <p className="mt-6 text-sm text-slate-500">Belum ada favorit. <Link href="/products" className="font-bold underline">Lihat katalog →</Link></p>}
    </div>
  );
}
