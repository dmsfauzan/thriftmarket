import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, email, password, role, storeName } = parsed.data;
  if (role === "SELLER" && (!storeName || storeName.trim().length < 3)) {
    return NextResponse.json({ error: { fieldErrors: { storeName: ["Nama toko minimal 3 karakter"] } } }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);

  if (role === "SELLER") {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hash, role: "SELLER", sellerStatus: "PENDING" },
      });
      await tx.store.create({
        data: { userId: user.id, storeName: storeName!.trim(), approval: "PENDING" },
      });
    });
  } else {
    await prisma.user.create({ data: { name, email, password: hash, role } });
  }

  return NextResponse.json({ ok: true });
}
