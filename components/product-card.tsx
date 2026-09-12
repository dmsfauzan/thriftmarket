import Link from "next/link";
import Image from "next/image";
import { Ruler } from "lucide-react";
import { formatIDR, conditionLabel } from "@/lib/utils";

type P = {
  id: string; title: string; price: number; condition: string;
  sizePxL?: string | null; sizeLabel?: string | null; status: string;
  brand?: string | null; store?: { storeName: string };
  images: { url: string; isDefect: boolean }[];
};

const badge: Record<string, string> = {
  LIKE_NEW: "bg-emerald-100 text-emerald-900",
  GOOD: "bg-amber-100 text-amber-900",
  FAIR: "bg-red-100 text-red-900",
};

export function ProductCard({ p }: { p: P }) {
  const main = p.images.find((i) => !i.isDefect)?.url ?? p.images[0]?.url;
  const sold = p.status !== "AVAILABLE";
  return (
    <Link href={`/products/${p.id}`} className="group overflow-hidden rounded-xl border border-sand-line bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/5] bg-sand-dark dark:bg-slate-800">
        {main && <Image src={main} alt={p.title} fill className="object-cover group-hover:scale-105 transition" />}
        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${badge[p.condition]}`}>{conditionLabel(p.condition)}</span>
        {sold && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">{p.status}</span>}
      </div>
      <div className="space-y-1 p-3 dark:bg-slate-900">
        <p className="text-xs text-forest/60 dark:text-slate-300">{p.brand ?? p.store?.storeName}</p>
        <h3 className="line-clamp-2 text-sm font-semibold dark:text-white">{p.title}</h3>
        {(p.sizeLabel || p.sizePxL) && <p className="flex items-center gap-1 text-xs text-forest/70 dark:text-slate-300"><Ruler size={12} />{p.sizeLabel ?? ""} {p.sizePxL ? `• ${p.sizePxL} cm` : ""}</p>}
        <p className="font-bold text-forest dark:text-emerald-300">{formatIDR(p.price)}</p>
      </div>
    </Link>
  );
}
