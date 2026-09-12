"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Store, Package, ClipboardList, Users, Tag, Star, Settings, ChevronDown,
  Search, Bell, Menu, X, LogOut, Crown, ShoppingBag, Megaphone, UserCircle2,
} from "lucide-react";
import { useDarkMode } from "@/components/use-dark-mode";

type NavItem = { label: string; href?: string; icon: any; badge?: string; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Public Profile", icon: UserCircle2, children: [{ label: "Toko & Storefront", href: "/admin/stores" }] },
  { label: "My Account", icon: Store, badge: "ThriftMarket", children: [{ label: "Settings", href: "/admin/settings" }, { label: "Security", href: "/admin/security" }] },
  { label: "Store - Client", icon: ShoppingBag, children: [{ label: "Home / Katalog", href: "/" }, { label: "Keranjang", href: "/cart" }, { label: "My Orders", href: "/admin/orders" }] },
  { label: "Produk", icon: Package, children: [{ label: "Inventori", href: "/admin/products" }, { label: "Kategori", href: "/admin/categories" }] },
  { label: "Pesanan", icon: ClipboardList, children: [{ label: "Semua Pesanan", href: "/admin/orders" }] },
  { label: "Pengguna", icon: Users, children: [{ label: "Daftar Users", href: "/admin/users" }, { label: "Sellers (Approval)", href: "/admin/sellers" }, { label: "Roles & Permissions", href: "/admin/roles" }] },
  { label: "Ulasan", icon: Star, href: "/admin/reviews" },
  { label: "Kupon & Promo", icon: Tag, href: "/admin/promos" },
  { label: "Campaigns", icon: Megaphone, href: "/admin/campaigns" },
];

function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({ "Public Profile": true, "My Account": true, "Store - Client": true, Produk: true, Pesanan: true, Pengguna: true });
  const isActive = (href: string) => pathname === href;
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">M</span>
        <div className="leading-tight"><p className="text-sm font-bold">ThriftMarket</p><p className="text-[11px] text-slate-400">Demo 6 • Admin</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-5">
          {NAV.map((item) => {
            if (item.href && !item.children) {
              return <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive(item.href) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}><item.icon size={18} />{item.label}{item.badge && <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>}</Link>;
            }
            const expanded = open[item.label] ?? false;
            return (
              <div key={item.label}>
                <button onClick={() => setOpen((s) => ({ ...s, [item.label]: !expanded }))} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50">
                  <item.icon size={16} />{item.label} <ChevronDown size={14} className={`ml-auto transition ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && item.children && (
                  <ul className="mt-1 space-y-0.5 pl-9">
                    {item.children.map((c) => <li key={c.href}><Link href={c.href} className={`block rounded-lg px-3 py-2 text-sm ${isActive(c.href) ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>{c.label}</Link></li>)}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-100 p-3">
        <Link href="/" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700"><Crown size={16} /> Lihat Storefront</Link>
      </div>
    </aside>
  );
}

function Topbar() {
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { dark, toggle } = useDarkMode();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-200">Overview</span><span className="text-slate-300 dark:text-slate-500">/</span><span className="text-sm font-bold text-slate-900 dark:text-white">Dashboard</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (cmd + /)" className="w-64 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:bg-white" />
        </div>
        <button onClick={toggle} className={`rounded-full border px-3 py-2 text-xs font-medium ${dark ? "border-amber-300 bg-amber-300 text-amber-950" : "border-slate-900 bg-slate-900 text-white"}`}>{dark ? "☀ Light" : "☾ Dark"}</button>
        <div className="relative">
          <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded-full border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"><Bell size={18} /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" /></button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="text-sm font-bold">Notifications</p>
              <p className="mt-2 text-xs text-slate-500">3 pesanan baru menunggu konfirmasi resi.</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">Joe Lincoln mentioned you — <b>Latest Trends</b> <span className="text-xs text-slate-400">18m ago</span></div>
                <div className="rounded-xl bg-slate-50 p-3">Leslie Alexander added tags to <b>Web Redesign 2024</b></div>
                <div className="rounded-xl bg-slate-50 p-3">Guy Hawkins requested access to <b>AirSpace</b></div>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1.5">
            <img src={session?.user?.image ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&q=80"} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
            <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{session?.user?.name ?? "Cody Fisher"}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="px-3 py-2"><p className="text-sm font-bold">{session?.user?.name ?? "Cody Fisher"}</p><p className="text-xs text-slate-500">{session?.user?.email ?? "c.fisher@gmail.com"}</p></div>
              <Link href="/admin/settings" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Public Profile</Link>
              <Link href="/admin/settings" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">My Profile</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={14} /> Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <div className="hidden lg:block"><Sidebar /></div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="h-full w-[300px] bg-white"><Sidebar /></div>
        </div>
      )}
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button className="rounded-lg border border-slate-200 p-2" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
          <span className="font-bold">Admin</span>
          <button className="ml-auto rounded-full border border-slate-200 p-2" onClick={() => setMobileOpen(false)}><X size={16} /></button>
        </div>
        <Topbar />
        <div className="flex-1 p-4 sm:p-6">
          {children}
          <p className="mt-10 text-center text-xs text-slate-400">2026 © Keenthemes Inc. — ThriftMarket Admin rebuilt from Metronic Demo 6</p>
        </div>
      </div>
    </div>
  );
}
