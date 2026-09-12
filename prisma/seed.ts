import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

async function main() {
  const cats = [
    { name: "Outerwear", slug: "outerwear" },
    { name: "Vintage Tees", slug: "vintage-tees" },
    { name: "Pants", slug: "pants" },
    { name: "Shirts", slug: "shirts" },
    { name: "Dresses", slug: "dresses" },
  ];
  for (const c of cats) await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });

  const hash = await bcrypt.hash("password123", 10);
  const seller = await prisma.user.upsert({
    where: { email: "seller@thrift.test" },
    update: { sellerStatus: "APPROVED", sellerRejectReason: null },
    create: { name: "Seller Demo", email: "seller@thrift.test", password: hash, role: "SELLER", sellerStatus: "APPROVED" },
  });
  const store = await prisma.store.upsert({
    where: { userId: seller.id },
    update: { approval: "APPROVED", rejectReason: null },
    create: { userId: seller.id, storeName: "Preloved Pilihan", description: "Thrift pilihan berkualitas, sudah dicuci & disortir.", approval: "APPROVED" },
  });
  await prisma.user.upsert({
    where: { email: "buyer@thrift.test" },
    update: {},
    create: { name: "Buyer Demo", email: "buyer@thrift.test", password: hash, role: "BUYER" },
  });

  await prisma.user.upsert({
    where: { email: "admin@thrift.test" },
    update: {},
    create: { name: "Admin Thrift", email: "admin@thrift.test", password: hash, role: "ADMIN" },
  });

  const cat = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));

  const products = [
    { title: "Denim Jacket Vintage 90s", slug: "outerwear", price: 185000, condition: "GOOD" as const, sizeLabel: "L", sizePxL: "66x58", brand: "Levi's", gender: "Unisex", description: "Denim jacket vintage, warna masih pekat, kancing lengkap.", defectDescription: "Pudar tipis di siku kiri", photos: ["photo-1551537482-f2075a1d41f2", "photo-1523205771623-e0faa4d2813d"] },
    { title: "Kaos Putih Basic Heavy Cotton", slug: "vintage-tees", price: 45000, condition: "LIKE_NEW" as const, sizeLabel: "M", sizePxL: "68x50", brand: "Uniqlo", gender: "Unisex", description: "Kaos putih bahan tebal, baru dipakai 1x.", photos: ["photo-1521572163474-6864f9cf17ab"] },
    { title: "Kemeja Flanel Kotak Merah", slug: "shirts", price: 75000, condition: "GOOD" as const, sizeLabel: "L", sizePxL: "72x54", brand: "H&M", gender: "Men", description: "Flanel hangat, cocok untuk layering.", photos: ["photo-1596755094514-f87e34085b2c"] },
    { title: "Hoodie Oversize Cream", slug: "outerwear", price: 120000, condition: "LIKE_NEW" as const, sizeLabel: "XL", sizePxL: "70x60", brand: "Zara", gender: "Unisex", description: "Hoodie fleece lembut, saku kanguru.", photos: ["photo-1556821840-3a63f95609a7"] },
    { title: "Jeans Straight Cut Biru", slug: "pants", price: 99000, condition: "GOOD" as const, sizeLabel: "M", sizePxL: "100x42", brand: "Cardinal", gender: "Men", description: "Jeans potongan lurus, pinggang karet belakang.", defectDescription: "Noda tipis di lutut kanan", photos: ["photo-1542272604-787c3835535d", "photo-1541099649105-f69ad21f3246"] },
    { title: "Dress Floral Midi", slug: "dresses", price: 135000, condition: "LIKE_NEW" as const, sizeLabel: "S", sizePxL: "110x44", brand: "Mango", gender: "Women", description: "Dress motif bunga, adem dan flowy.", photos: ["photo-1595777457583-95e059d581b8"] },
    { title: "Crewneck Vintage Navy", slug: "outerwear", price: 89000, condition: "GOOD" as const, sizeLabel: "M", sizePxL: "66x52", brand: "Thrifted", gender: "Unisex", description: "Crewneck sablon retro, rib masih kencang.", photos: ["photo-1578681994506-b8f463449011"] },
    { title: "Windbreaker Parasut Hitam", slug: "outerwear", price: 110000, condition: "GOOD" as const, sizeLabel: "L", sizePxL: "69x56", brand: "Nike", gender: "Men", description: "Jaket parasut ringan anti angin.", photos: ["photo-1591047139829-d91aecb6caea"] },
    { title: "Polo Shirt Putih", slug: "vintage-tees", price: 65000, condition: "GOOD" as const, sizeLabel: "M", sizePxL: "67x48", brand: "Lacoste", gender: "Men", description: "Polo klasik, kerah masih tegak.", photos: ["photo-1586790170083-2f9ceadc732d"] },
    { title: "Blazer Kerja Abu", slug: "outerwear", price: 150000, condition: "LIKE_NEW" as const, sizeLabel: "M", sizePxL: "68x49", brand: "H&M", gender: "Women", description: "Blazer formal, cutting rapi.", photos: ["photo-1594938298603-c8148c4dae35"] },
    { title: "Rok Plisket Coklat", slug: "dresses", price: 55000, condition: "GOOD" as const, sizeLabel: "S", sizePxL: "85x38", brand: "Uniqlo", gender: "Women", description: "Rok plisket jatuh, pinggang full karet.", photos: ["photo-1583496661160-fb5886a13d44"] },
    { title: "Sweater Rajut Beige", slug: "shirts", price: 95000, condition: "FAIR" as const, sizeLabel: "L", sizePxL: "64x55", brand: "Thrifted", gender: "Women", description: "Sweater rajut hangat.", defectDescription: "Berbulu halus di badan + lubang kecil di lengan", photos: ["photo-1611312449408-fcece27cdbb7", "photo-1434389677669-e08b4cac3105"] },
  ];

  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { title: p.title, storeId: store.id } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: cat[p.slug],
        title: p.title,
        description: p.description,
        price: p.price,
        condition: p.condition,
        sizeLabel: p.sizeLabel,
        sizePxL: p.sizePxL,
        brand: p.brand,
        gender: p.gender,
        defectDescription: p.defectDescription ?? null,
        status: "AVAILABLE",
        approval: "APPROVED",
        images: {
          create: p.photos.map((ph, i) => ({
            url: img(ph),
            isDefect: p.photos.length > 1 && i === p.photos.length - 1 && !!p.defectDescription,
          })),
        },
      },
    });
  }
  console.log("Seed OK: 12 produk dummy");
}

main().finally(() => prisma.$disconnect());
