"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag, CheckCircle2 } from "lucide-react";
import { formatIDR, conditionLabel } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { WishlistButton, ChatButton, FollowButton } from "@/components/extras";

export default function ProductDetail({ product }: { product: any }) {
  const [active, setActive] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const router = useRouter();
  const sold = product.status !== "AVAILABLE";
  const img = product.images[active];
  async function addToCart() {
    const r = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    if (r.status === 401) return router.push("/login");
    if (!r.ok) {
      setCartMsg((await r.json()).error ?? "Gagal menambah keranjang");
      setCartOpen(true);
      return;
    }
    setCartMsg("");
    setCartOpen(true);
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 dark:bg-slate-950 md:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-sand-line bg-white dark:border-slate-700 dark:bg-slate-900">
          {img && <Image src={img.url} alt={product.title} fill className="object-cover" />}
          {img?.isDefect && <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">FOTO DEFECT / MINUS</span>}
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {product.images.map((i: any, idx: number) => (
            <button key={idx} onClick={() => setActive(idx)} className={`relative aspect-square overflow-hidden rounded-lg border ${idx === active ? "border-forest" : "border-sand-line"}`}>
              <Image src={i.url} alt="" fill className="object-cover" />
              {i.isDefect && <span className="absolute bottom-0 w-full bg-red-600/90 text-center text-[10px] text-white">DEFECT</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">{conditionLabel(product.condition)}{product.defectDescription ? ` — ${product.defectDescription}` : ""}</span>
        <h1 className="text-2xl font-bold dark:text-white">{product.title}</h1>
        <p className="text-3xl font-bold text-forest dark:text-emerald-300">{formatIDR(product.price)}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-sand-dark p-3 dark:bg-slate-800 dark:text-slate-200">Brand: <b>{product.brand ?? "-"}</b></div>
          <div className="rounded-xl bg-sand-dark p-3 dark:bg-slate-800 dark:text-slate-200">Ukuran: <b>{product.sizeLabel ?? "-"} {product.sizePxL ? `(${product.sizePxL} cm)` : ""}</b></div>
          <div className="rounded-xl bg-sand-dark p-3 dark:bg-slate-800 dark:text-slate-200">Gender: <b>{product.gender ?? "-"}</b></div>
          <div className="rounded-xl bg-sand-dark p-3 dark:bg-slate-800 dark:text-slate-200">Toko: <b>{product.store.storeName}</b></div>
        </div>
        <p className="whitespace-pre-line text-sm text-forest/80 dark:text-slate-300">{product.description}</p>
        <p className="flex items-center gap-2 text-xs text-forest/70 dark:text-slate-300"><ShieldCheck size={14} /> Escrow: dana diteruskan ke penjual setelah barang diterima.</p>
        <div className="flex gap-2">
          <button disabled={sold} onClick={() => router.push(`/checkout?ids=${product.id}`)} className="flex-1 rounded-xl bg-forest py-3 font-semibold text-sand disabled:opacity-40 dark:bg-emerald-600 dark:text-white">{sold ? product.status : "Beli Sekarang"}</button>
          <button disabled={sold} onClick={addToCart} className="flex-1 rounded-xl border border-forest py-3 font-semibold disabled:opacity-40 dark:border-emerald-500 dark:text-emerald-300">+ Keranjang</button>
          <WishlistButton productId={product.id} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChatButton storeId={product.store.id} storeName={product.store.storeName} />
          <FollowButton storeId={product.store.id} />
          <span className="text-xs text-slate-400">Rating toko {Number(product.store.rating ?? 0).toFixed(1)}★</span>
        </div>
        {Array.isArray(product.related) && product.related.length > 0 && (
          <div className="pt-4">
            <p className="mb-2 text-sm font-bold dark:text-white">Produk serupa / dari toko ini</p>
            <div className="grid grid-cols-2 gap-2">
              {product.related.slice(0, 4).map((r: any) => (
                <Link key={r.id} href={`/products/${r.id}`} className="rounded-xl border border-sand-line p-2 text-xs dark:border-slate-700 dark:text-white">
                  {r.title}<br /><b>{formatIDR(r.price)}</b>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Modal open={cartOpen} onClose={() => setCartOpen(false)} title={cartMsg ? "Gagal" : "Ditambahkan ke Keranjang"}>
        {cartMsg ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">{cartMsg}</p>
        ) : (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />{product.title} — {formatIDR(product.price)} masuk keranjang.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={() => setCartOpen(false)} className="rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Lanjut Belanja</button>
              <Link href="/cart" className="flex items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-center text-sm font-semibold text-white dark:bg-emerald-600"><ShoppingBag size={15} /> Lihat Keranjang</Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
