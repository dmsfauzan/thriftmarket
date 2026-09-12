import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_MB = 5;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Upload belum dikonfigurasi (Cloudinary)" }, { status: 503 });
  }

  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);

  if (!files.length) return NextResponse.json({ error: "Belum memilih file" }, { status: 400 });
  if (files.length > 5) return NextResponse.json({ error: "Maksimal 5 foto" }, { status: 400 });

  for (const f of files) {
    if (!ALLOWED.has(f.type)) return NextResponse.json({ error: `Tipe file tidak didukung: ${f.type}` }, { status: 400 });
    if (f.size > MAX_MB * 1024 * 1024) return NextResponse.json({ error: `File ${f.name} melebihi ${MAX_MB}MB` }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const res = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "thriftmarket/products", resource_type: "image" }, (err, result) => {
          if (err || !result) reject(err);
          else resolve(result as { secure_url: string });
        }).end(buffer);
      });
      urls.push(res.secure_url);
    } catch (e) {
      return NextResponse.json({ error: "Upload Cloudinary gagal" }, { status: 502 });
    }
  }
  return NextResponse.json({ urls });
}
