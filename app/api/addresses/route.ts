import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as { id: string }).id;
  return NextResponse.json(await prisma.address.findMany({ where: { userId }, orderBy: [{ isPrimary: "desc" }, { id: "desc" }] }));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const street = String(body.street ?? "").trim();
  const city = String(body.city ?? "").trim();
  const province = String(body.province ?? "").trim();
  const postalCode = String(body.postalCode ?? "").trim();
  const label = String(body.label ?? "Rumah").trim() || "Rumah";
  const latitude = body.latitude === null || body.latitude === undefined || body.latitude === "" ? null : Number(body.latitude);
  const longitude = body.longitude === null || body.longitude === undefined || body.longitude === "" ? null : Number(body.longitude);
  const provinceId = String(body.provinceId ?? "").trim() || null;
  const cityId = String(body.cityId ?? "").trim() || null;
  const subdistrictId = String(body.subdistrictId ?? "").trim() || null;
  const phone = String(body.phone ?? "").trim() || null;

  if (street.length < 5) return NextResponse.json({ error: "Alamat minimal 5 karakter" }, { status: 400 });
  if (!city || !province) return NextResponse.json({ error: "Kota & provinsi wajib diisi" }, { status: 400 });
  if (!/^\d{4,6}$/.test(postalCode)) return NextResponse.json({ error: "Kode pos harus 4-6 digit angka" }, { status: 400 });
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) return NextResponse.json({ error: "Latitude tidak valid" }, { status: 400 });
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) return NextResponse.json({ error: "Longitude tidak valid" }, { status: 400 });
  if (phone && !/^\+?[0-9]{9,15}$/.test(phone.replace(/[\s-]/g, ""))) return NextResponse.json({ error: "No. HP tidak valid" }, { status: 400 });

  const count = await prisma.address.count({ where: { userId } });
  const makePrimary = !!body.isPrimary || count === 0;
  if (makePrimary) await prisma.address.updateMany({ where: { userId }, data: { isPrimary: false } });

  const address = await prisma.address.create({
    data: { userId, street, city, province, postalCode, latitude, longitude, provinceId, cityId, subdistrictId, phone, isPrimary: makePrimary, label },
  });
  return NextResponse.json(address);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const owned = await prisma.address.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isPrimary: false } }),
    prisma.address.update({ where: { id }, data: { isPrimary: true } }),
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const owned = await prisma.address.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  if (owned.isPrimary) {
    const next = await prisma.address.findFirst({ where: { userId }, orderBy: { id: "desc" } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isPrimary: true } });
  }
  return NextResponse.json({ ok: true });
}
