"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Store, Menu, X, Sun, Moon, ChevronDown, User, Package, LogOut, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "@/components/use-dark-mode";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Katalog" },
  { href: "#how", label: "Cara Kerja" },
  { href: "#features", label: "Fitur" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await fetch("/api/cart")).json(),
    enabled: !!session,
  });
  const count = Array.isArray(cart) ? cart.length : 0;
  const { dark, toggle } = useDarkMode();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = (session?.user?.name ?? "B").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button className="rounded-lg p-2 text-slate-600 dark:text-slate-300 lg:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">T</span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">ThriftMarket <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">SaaS</span></span>
        </Link>
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            title={dark ? "Mode terang" : "Mode gelap"}
            className="rounded-full border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link href="/cart" aria-label="cart" className="relative rounded-full border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <ShoppingBag size={17} />
            {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white">{count}</span>}
          </Link>
          {session ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name ?? "user"} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{initial}</span>
                )}
                <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">{session.user?.name}</span>
                <ChevronDown size={14} className={`text-slate-400 transition ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center gap-3 px-3 py-2">
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name ?? "user"} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{initial}</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold dark:text-white">{session.user?.name ?? "Buyer"}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{session.user?.email ?? ""}</p>
                    </div>
                  </div>
                  <span className="mx-3 mb-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">{role ?? "BUYER"}</span>
                  <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
                    <Link href="/cart" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><ShoppingBag size={15} /> Keranjang Saya</Link>
                    <Link href="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><Package size={15} /> Pesanan Saya</Link>
                    <Link href="/addresses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><MapPin size={15} /> Alamat Pengiriman</Link>
                    {role !== "BUYER" && (
                      <Link href="/seller" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><Store size={15} /> Dashboard Seller</Link>
                    )}
                    <Link href="/seller/register" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><User size={15} /> Buka Toko / Jadi Seller</Link>
                    <button onClick={() => signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"><LogOut size={15} /> Keluar</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:block">Masuk</Link>
              <Link href="/seller/register" className="hidden items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 md:flex"><Store size={14} /> Mulai Jualan</Link>
              <Link href="/products" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Get Started</Link>
            </>
          )}
        </div>
      </div>
      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{l.label}</Link>
          ))}
          {!session && (
            <Link href="/seller/register" onClick={() => setOpen(false)} className="mt-1 block rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300">Mulai Jualan (Seller)</Link>
          )}
        </nav>
      )}
    </header>
  );
}
