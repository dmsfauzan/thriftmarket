import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

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

  let sellerUserId: string | null = null;
  let sellerStoreName: string | null = null;
  if (role === "SELLER") {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hash, role: "SELLER", sellerStatus: "PENDING" },
      });
      sellerUserId = user.id;
      sellerStoreName = storeName!.trim();
      await tx.store.create({
        data: { userId: user.id, storeName: sellerStoreName, approval: "PENDING" },
      });
    });
  } else {
    await prisma.user.create({ data: { name, email, password: hash, role } });
  }

  if (role === "SELLER" && sellerUserId && sellerStoreName) {
    await logActivity({
      action: "SELLER_REGISTER",
      actorId: sellerUserId,
      actorName: name,
      actorRole: "SELLER",
      message: `${name} (${email}) mendaftar sebagai seller — toko "${sellerStoreName}" menunggu approval`,
      targetId: sellerUserId,
      metadata: { email, storeName: sellerStoreName },
    });
  }

  return NextResponse.json({ ok: true });
}
