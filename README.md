# ThriftMarket

Marketplace e-commerce khusus produk **thrifting / preloved** — 1 item = 1 stok tunggal. Pembeli berburu pakaian bekas berkualitas dengan transparansi kondisi (foto defect + ukuran PxL cm), penjual membuka toko yang dimoderasi admin, transaksi diamankan sistem **escrow** via Midtrans Snap.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript strict
- **Styling:** Tailwind CSS + Lucide Icons (tema Metronic SaaS / Demo 6)
- **State:** TanStack Query + Zustand
- **Database:** MySQL + Prisma ORM
- **Auth:** Auth.js / NextAuth (Credentials + Google OAuth)
- **Upload:** Cloudinary
- **Payment:** Midtrans Snap (Sandbox) • **Ongkir:** simulasi flat JNE/J&T/SiCepat

## Fitur Utama

- **Triple login terpisah:** Buyer `/login`, Seller `/seller/login`, Admin `/admin/login` (credentials; Google hanya buyer)
- **Seller approval flow:** register seller + nama toko custom → status PENDING → approve/reject admin (`/admin/sellers`); login PENDING dibatasi ke `/seller/pending`
- **Moderasi produk:** produk baru berstatus PENDING, tidak tampil di katalog sampai admin approve; reject bisa diedit & ajukan ulang; edit produk/toko yang sudah live tidak perlu re-approve
- **Katalog thrifting:** search, filter harga/kondisi/ukuran PxL/kategori; badge kondisi & ukuran di `ProductCard`
- **Detail produk:** galeri + badge foto defect, tombol Beli/Keranjang (disable jika BOOKED/SOLD), modal konfirmasi tambah keranjang
- **Cart & checkout escrow:** transaksi atomik anti double-booking, Snap token Midtrans (expiry 24 jam), kurir JNE/J&T/SiCepat
- **Order lifecycle:** PENDING_PAYMENT → PAID → SHIPPED (input resi) → COMPLETED (konfirmasi buyer); webhook Midtrans terverifikasi signature SHA-512
- **Alamat buyer:** CRUD + alamat utama, modal tambah alamat di `/addresses` & `/checkout`, dropdown profil buyer (keranjang, pesanan, alamat)
- **Seller Center:** dashboard Metronic terbatas (overview, inventori, pesanan+resi, toko, ulasan) + dark mode
- **Admin panel:** Metronic Demo 6 (overview, sellers, products, orders, users, categories, settings, dark mode persisten)
- **Dark mode global:** buyer/admin/seller via `localStorage` (`thrift-theme`) + anti-flash script

## Struktur Penting

```
app/
  page.tsx                 # landing Metronic SaaS
  login/ register/         # auth buyer
  products/ cart/ checkout/ orders/ addresses/
  seller/
    login/ register/ pending/
    (panel)/               # dashboard (guard APPROVED)
  admin/
    login/
    (panel)/               # dashboard (guard ADMIN)
  api/
    auth/ products/ cart/ checkout/ orders/ reviews/
    addresses/ upload/ seller/ admin/
prisma/
  schema.prisma            # MySQL + enum ApprovalStatus
  seed.ts                  # akun demo + 12 produk
lib/ auth.ts seller.ts admin.ts validators.ts
components/ navbar.tsx admin/shell.tsx seller/shell.tsx
```

## Quickstart

```bash
npm install
cp .env.example .env        # isi DATABASE_URL, AUTH_SECRET, dst (lihat bawah)
npx prisma db push
npm run db:seed
npm run dev                 # http://localhost:3000
```

> Windows PowerShell dengan ExecutionPolicy Restricted: gunakan `npm.cmd` / `npx.cmd` (mis. `npm.cmd run dev`).

## Environment Variables

| Key | Keterangan |
|---|---|
| `DATABASE_URL` | `mysql://root:@localhost:3306/thriftmarket` |
| `AUTH_SECRET` | random min 32 char |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth buyer (opsional) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | upload foto (tanpa ini upload balikan 503 jelas) |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` / `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | sandbox `SB-Mid-*` |

## Akun Demo (password: `password123`)

| Role | Email | Login di |
|---|---|---|
| Buyer | `buyer@thrift.test` | `/login` |
| Seller (APPROVED) | `seller@thrift.test` | `/seller/login` |
| Admin | `admin@thrift.test` | `/admin/login` |

Seller baru daftar di `/seller/register` → PENDING → approve di `/admin/sellers`.

## Alur Bisnis Inti

1. Seller daftar + nama toko → admin approve akun/toko.
2. Seller upload produk (PENDING) → admin approve → tampil di katalog.
3. Buyer tambah keranjang (modal) → checkout + alamat + kurir → Snap Midtrans → produk BOOKED.
4. Webhook settlement → PAID → produk SOLD → cart terkait dibersihkan.
5. Seller input resi → SHIPPED → buyer konfirmasi → COMPLETED (+ rating toko).
6. Expire/cancel → order CANCELLED → produk kembali AVAILABLE.

## API Ringkas

| Method & Path | Akses | Deskripsi |
|---|---|---|
| `POST /api/auth/register` | publik | buyer langsung aktif; seller PENDING + store PENDING (transaksional) |
| `GET/POST /api/products` | publik / seller+ | katalog default `AVAILABLE+APPROVED`; seller buat PENDING |
| `PATCH /api/products/[id]` | seller | edit milik sendiri; `resubmit:true` untuk REJECTED → PENDING |
| `POST /api/cart`, `GET`, `DELETE` | buyer | tolak SOLD/non-approved/self-buy; auto-cleanup |
| `POST /api/checkout` | buyer | guard stok atomik + validasi alamat milik sendiri |
| `GET /api/orders` | buyer | tanpa param = riwayat milik sendiri; dengan `orderNumber` = detail (ownership check) |
| `POST /api/orders` | webhook | verifikasi signature Midtrans |
| `POST /api/orders/confirm` | buyer | hanya SHIPPED → COMPLETED (idempoten) |
| `GET/PATCH /api/seller/orders` | seller APPROVED | pesanan toko + input resi (hanya PAID) |
| `PATCH /api/seller/store` | seller | edit toko (tanpa re-approve) |
| `GET /api/seller/status` | seller | status approval sendiri |
| `GET/PATCH /api/admin/sellers` | admin | moderasi seller + store atomik |
| `GET/PATCH/DELETE /api/admin/products` | admin | moderasi produk + hapus aman |
| `GET/PATCH/DELETE /api/admin/users` | admin | ubah role + hapus aman |

## Scripts

| Script | Fungsi |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `start` | production |
| `npm run typecheck` | `tsc --noEmit` (wajib hijau sebelum push) |
| `npm run db:push` / `db:seed` | sync schema + seed demo |

## Catatan

- Auto-complete 1x24 jam saat ini berupa teks panduan (cron belum ada) — konfirmasi manual via tombol.
- Nama toko boleh duplikat (moderasi manual oleh admin).
- Kredensial demo di halaman login hanya untuk development — cabut sebelum production.
