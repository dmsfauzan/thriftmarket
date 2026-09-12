import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import {
  ArrowRight, Check, Search, Camera, Truck, ShieldCheck,
  Zap, PackageCheck, Users, TrendingUp, Star, Mail, Phone, MapPin,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";

const AVATARS = [
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&q=80",
];

const BRANDS = ["Google", "Apple", "SpaceX", "OpenAI", "Microsoft", "Amazon", "Youtube", "Tesla", "Spotify", "Uber"];

const STEPS = [
  { icon: Search, title: "Cari & Temukan", desc: "Filter ukuran PxL, kondisi, dan brand. Setiap item unik dengan stok tunggal." },
  { icon: Camera, title: "Cek Kondisi Transparan", desc: "Foto defect jujur, deskripsi minus lengkap, tak ada yang disembunyikan." },
  { icon: ShieldCheck, title: "Bayar via Escrow", desc: "Dana ditahan aman dan diteruskan ke penjual setelah barang diterima." },
  { icon: Truck, title: "Terima & Konfirmasi", desc: "Lacak resi real-time, konfirmasi dalam 1x24 jam atau otomatis selesai." },
];

const FEATURES = [
  { icon: Zap, stat: "10x lebih cepat", label: "Speed Increase", title: "Katalog Super Cepat", desc: "Pencarian dan filter thrifting instan yang beradaptasi dengan gayamu." },
  { icon: PackageCheck, stat: "100%", label: "Transparan", title: "Jaminan Kondisi Jujur", desc: "Foto minus wajib dan ukuran PxL cm real untuk setiap listing." },
  { icon: Users, stat: "10k+", label: "Active Users", title: "Komunitas Thrift", desc: "Ribuan pemburu preloved dan seller terkurasi bergabung setiap bulan." },
  { icon: TrendingUp, stat: "90%", label: "Hemat", title: "Harga Preloved Terbaik", desc: "Dapatkan brand premium dengan harga hingga 90% lebih murah." },
];

const TESTIS = [
  { q: "ThriftMarket mengubah cara saya belanja. Kondisinya selalu sesuai foto!", n: "Sarah Chen", r: "CEO, TechStart", img: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=96&q=75" },
  { q: "Fitur foto defect-nya game-changing. Tidak pernah kecewa lagi.", n: "Marcus Johnson", r: "CTO, InnovateLab", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=96&q=75" },
  { q: "Jual barang preloved laku dalam sehari. Sistem escrow-nya aman banget.", n: "Emily Rodriguez", r: "Founder, GrowthCo", img: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=96&q=75" },
  { q: "Integrasi Midtrans mulus, checkout 1 menit langsung dapat QRIS.", n: "David Kim", r: "VP, ScaleUp Inc", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=75" },
  { q: "Ukuran PxL cm-nya akurat. Semua jaket yang saya beli pas.", n: "Lisa Thompson", r: "CMO, BrandForward", img: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=96&q=75" },
  { q: "Support responsif, komplain defect langsung diproses refund.", n: "Michael Brown", r: "Head of Operations, ScaleTech", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=75" },
];

const PLANS = [
  { name: "Starter", desc: "Untuk pemburu thrift kasual", price: 0, feats: ["Browsing katalog unlimited", "Filter kondisi & PxL", "1 alamat pengiriman", "Support email", "Notifikasi order"], cta: "Mulai Gratis", hot: false },
  { name: "Professional", desc: "Untuk seller & kolektor serius", price: 49000, feats: ["Semua fitur Starter", "Buka toko & listing unlimited", "Badge seller terverifikasi", "Analitik toko", "Prioritas tampil di katalog", "API access", "Prioritas support"], cta: "Get Started", hot: true },
  { name: "Enterprise", desc: "Untuk brand & thrift store besar", price: 199000, feats: ["Semua fitur Professional", "Multi-admin toko", "Bulk upload produk", "Laporan penjualan custom", "Dedicated support 24/7", "Onboarding khusus"], cta: "Hubungi Kami", hot: false },
];

const FAQS = [
  { q: "Apa itu sistem 1 item = 1 stok?", a: "Setiap produk thrift hanya ada satu. Begitu masuk keranjang orang lain dan dibayar, status otomatis BOOKED lalu SOLD — tidak bisa dibeli ganda." },
  { q: "Bagaimana jaminan kondisi barang?", a: "Seller wajib mengunggah foto defect/minus dan mengisi ukuran PxL cm. Dana escrow hanya cair setelah pembeli konfirmasi terima." },
  { q: "Metode pembayaran apa saja?", a: "Via Midtrans Snap sandbox: QRIS, Virtual Account bank, e-wallet, dan gerai retail." },
  { q: "Berapa ongkos kirimnya?", a: "Simulasi flat Rp15.000 untuk JNE, J&T, dan SiCepat. Berat dihitung otomatis per item." },
  { q: "Bagaimana jika barang tidak sesuai?", a: "Ajukan komplain sebelum konfirmasi terima (1x24 jam). Dana masih ditahan escrow dan bisa direfund." },
  { q: "Apakah bisa menjadi penjual?", a: "Ya, daftar sebagai SELLER dan toko otomatis dibuat. Upload foto produk, isi kondisi & PxL, listing langsung tayang." },
];

function Stars() {
  return <div className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>;
}

export default async function Home() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "AVAILABLE", approval: "APPROVED" }, include: { images: true, store: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO — centered ala Metronic SaaS */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-50 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 pb-10 pt-16 text-center sm:pt-24">
          <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Baru</span>
            12 drop preloved terbaru minggu ini <ArrowRight size={13} />
          </Link>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight dark:text-white sm:text-6xl">
            Ship Amazing<br />Thrift Finds
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 dark:text-slate-300 sm:text-lg">
            Berburu pakaian preloved berkualitas kini effortless. Dari klik ke checkout hanya dalam hitungan menit — transparan, aman, terkurasi.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/products" className="w-full rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto">Get started for free</Link>
            <Link href="#features" className="w-full rounded-full border border-slate-300 px-8 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800 sm:w-auto">Explore Katalog</Link>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="flex -space-x-3">
              {AVATARS.map((a, i) => <Image key={i} src={a} alt="user" width={36} height={36} className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-slate-700" />)}
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white dark:border-slate-700">10k+</span>
            </div>
            <div className="text-left">
              <Stars />
              <p className="text-xs text-slate-500 dark:text-slate-300">Dipercaya <b>10.000+</b> pemburu thrift</p>
            </div>
          </div>
        </div>
        {/* kategori populer */}
        <div className="relative mx-auto max-w-6xl px-4 pb-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {categories.map((c) => (
              <Link key={c.id} href={`/products?category=${c.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <p className="text-sm font-bold">{c.name}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-300">Jelajahi →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-10 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-300">Trusted by thousands of thrifters • Top Brand Preloved</p>
        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4">
          {BRANDS.map((b) => <span key={b} className="text-lg font-extrabold tracking-tight text-slate-300 transition hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-200">{b}</span>)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">Easy Setup</p>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">How It Works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Proses streamlined — dari cari sampai barang sampai, dengan escrow yang mengurus sisanya.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <span className="absolute right-5 top-5 text-4xl font-black text-slate-100 dark:text-slate-700">0{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"><s.icon size={20} /></span>
              <h3 className="mt-4 font-bold dark:text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">Ready to get started? It takes less than 5 minutes. <Link href="/register" className="font-semibold text-slate-900 underline">Start Your Journey →</Link></p>
      </section>

      {/* PRODUK TERBARU */}
      <section className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Fresh Drop</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight dark:text-white">Produk Terbaru</h2>
            </div>
            <Link href="/products" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-white dark:border-slate-600 dark:text-white dark:hover:bg-slate-800">Lihat Semua →</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} p={p as never} />)}
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">Key Features</p>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Key Features</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Semua tools yang kamu butuhkan untuk berburu dan berjualan preloved secara efisien.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <p className="text-2xl font-black tracking-tight dark:text-white">{f.stat}</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-300">{f.label}</p>
              <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white"><f.icon size={20} /></span>
              <h3 className="mt-4 font-bold dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">Testimonials</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Loved by Thousands</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Kenapa thrifter cinta ThriftMarket — rasakan transformative power-nya.</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIS.map((t, i) => (
              <figure key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <Stars />
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">“{t.q}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Image src={t.img} alt={t.n} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                  <div><p className="text-sm font-bold dark:text-white">{t.n}</p><p className="text-xs text-slate-400 dark:text-slate-400">{t.r}</p></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">Pricing</p>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Simple & Transparent Pricing</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Pilih paket yang pas. Pembeli selalu gratis.</p>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
          {PLANS.map((pl) => (
            <div key={pl.name} className={`relative rounded-3xl border p-7 ${pl.hot ? "border-slate-900 bg-slate-900 text-white shadow-xl dark:border-emerald-500 dark:bg-slate-900" : "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"}`}>
              {pl.hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-[11px] font-bold uppercase text-white">Most Popular</span>}
              <h3 className="text-lg font-bold">{pl.name}</h3>
              <p className={`mt-1 text-sm ${pl.hot ? "text-slate-300" : "text-slate-500 dark:text-slate-300"}`}>{pl.desc}</p>
              <p className="mt-4 text-4xl font-black">Rp{pl.price.toLocaleString("id-ID")}<span className={`text-sm font-normal ${pl.hot ? "text-slate-400" : "text-slate-400"}`}>/bulan</span></p>
              <ul className="mt-6 space-y-2.5">
                {pl.feats.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${pl.hot ? "text-slate-200" : "text-slate-600"}`}><Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />{f}</li>
                ))}
              </ul>
              <Link href="/register" className={`mt-7 block rounded-full py-3 text-center text-sm font-semibold ${pl.hot ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-700"}`}>{pl.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-600">FAQ</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <summary className="cursor-pointer list-none text-sm font-bold">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">Still have questions? <Link href="#contact" className="font-semibold text-slate-900 underline">Contact our Support Team</Link></p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="rounded-[2rem] bg-slate-900 px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Start your free trial today.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">Ready to get started? Daftar gratis, langsung bisa belanja & buka toko.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">Get started for free</Link>
            <Link href="/products" className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold hover:bg-white/10">Lihat Katalog</Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Get in Touch</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Contact Us</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">Punya pertanyaan atau siap mulai jualan preloved? Kirim pesan, kami balas secepatnya.</p>
            <div className="mt-6 space-y-4">
              <p className="flex items-center gap-3 text-sm dark:text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"><Mail size={17} /></span><span><b>Email</b><br /><span className="text-slate-500 dark:text-slate-300">hello@thriftmarket.id</span></span></p>
              <p className="flex items-center gap-3 text-sm dark:text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"><Phone size={17} /></span><span><b>Phone</b><br /><span className="text-slate-500 dark:text-slate-300">+62 812-3456-7890</span></span></p>
              <p className="flex items-center gap-3 text-sm dark:text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"><MapPin size={17} /></span><span><b>Address</b><br /><span className="text-slate-500 dark:text-slate-300">Jl. Preloved No. 88, Bandung</span></span></p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
