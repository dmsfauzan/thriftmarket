"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { formatIDR } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ["cart"], queryFn: async () => (await fetch("/api/cart")).json() });
  const items = Array.isArray(data) ? data : [];
  async function remove(productId: string) {
    await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
    location.reload();
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 dark:bg-slate-950">
      <h1 className="text-xl font-bold dark:text-white">Keranjang ({items.length})</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"><ShoppingBag size={24} /></span>
          <p className="mt-4 font-bold dark:text-white">Keranjangmu masih kosong</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Yuk berburu preloved pilihan — 1 item 1 stok, siapa cepat dia dapat.</p>
          <Link href="/products" className="mt-5 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white dark:bg-emerald-600">Lihat Katalog →</Link>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {items.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-sand-line bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex-1"><p className="font-semibold dark:text-white">{c.product.title}</p><p className="text-sm dark:text-slate-300">{formatIDR(c.product.price)}</p></div>
                <button onClick={() => remove(c.productId)} className="text-sm text-red-600 dark:text-red-400">Hapus</button>
              </div>
            ))}
          </div>
          <button onClick={() => router.push(`/checkout?ids=${items.map((c: any) => c.productId).join(",")}`)} className="mt-6 w-full rounded-xl bg-forest py-3 font-semibold text-sand dark:bg-emerald-600 dark:text-white">Checkout</button>
        </>
      )}
    </div>
  );
}
