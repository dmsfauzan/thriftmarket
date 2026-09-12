"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

const FOOT = [
  ["product", ["Features", "Pricing", "API", "Documentation"]],
  ["company", ["About", "Blog", "Careers", "Contact"]],
  ["support", ["Help Center", "Community", "Status", "Security"]],
] as const;

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">T</span>
                <span className="text-lg font-bold tracking-tight dark:text-white">ThriftMarket <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">SaaS</span></span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">Transform your thrift hunt with our SaaS platform. Preloved terkurasi, escrow aman, ukuran PxL transparan.</p>
            </div>
            {FOOT.map(([title, links]) => (
                    <div key={title}>
                      <p className="text-sm font-bold capitalize dark:text-white">{title}</p>
                      <ul className="mt-3 space-y-2">
                        {links.map((l) => (
                          <li key={l}><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">{l}</Link></li>
                        ))}
                      </ul>
                    </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row">
            <p>© 2025 ThriftMarket. All rights reserved.</p>
            <p>Theme inspired by Metronic SaaS by KeenThemes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
