import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1000) })).min(1).max(10),
});

const SYSTEM_PROMPT = `Kamu adalah Asisten AI ThriftMarket — marketplace preloved transparan di Indonesia.
Aturan fakta (jangan mengarang):
- 1 item = 1 stok, status AVAILABLE/BOOKED/SOLD.
- Foto defect/minus wajib + ukuran PxL cm.
- Kondisi: LIKE_NEW, GOOD, FAIR.
- Ongkir flat Rp15.000 untuk JNE, JNT, SiCepat. Berat per item otomatis.
- Pembayaran escrow via Midtrans Snap sandbox (QRIS/VA/e-wallet). Dana cair setelah buyer konfirmasi terima (otomatis 1x24 jam jika tidak ada komplain).
- Seller daftar di /seller/register, butuh approval admin.
- Chat buyer-seller ada di /chat.
- Harga dalam Rupiah (IDR).
Gaya: bahasa Indonesia santai-profesional, ringkas, ramah. Jika user minta cari produk, panggil tool searchProducts. Jika pertanyaan di luar katalog/FAQ ThriftMarket, jawab singkat: "Maaf, saya hanya bisa bantu seputar katalog, kondisi, ukuran, ongkir, dan FAQ ThriftMarket. Coba tanya soal produk atau lihat /products." Selalu akhiri dengan ajakan lihat produk jika relevan.
PENTING FORMAT: Jangan pernah gunakan karakter "*" sama sekali. Jangan pakai markdown bold/italic/list dengan "*". Untuk penekanan cukup kapitalisasi atau tanda hubung "-". Untuk list gunakan "-" atau angka "1." saja.`;

type ToolArgs = { q?: string; min?: number; max?: number; condition?: "LIKE_NEW" | "GOOD" | "FAIR"; category?: string };

async function searchProducts(a: ToolArgs) {
  const where: Record<string, unknown> = { status: "AVAILABLE", approval: "APPROVED" };
  if (a.q?.trim()) {
    const q = a.q.trim();
    (where as Record<string, unknown>).OR = [{ title: { contains: q } }, { brand: { contains: q } }, { description: { contains: q } }];
  }
  if (a.min !== undefined || a.max !== undefined) {
    const price: Record<string, number> = {};
    if (typeof a.min === "number" && !Number.isNaN(a.min)) price.gte = a.min;
    if (typeof a.max === "number" && !Number.isNaN(a.max)) price.lte = a.max;
    (where as Record<string, unknown>).price = price;
  }
  if (a.condition) (where as Record<string, unknown>).condition = a.condition;
  if (a.category) (where as Record<string, unknown>).categoryId = a.category;
  const products = await prisma.product.findMany({
    where: where as never,
    include: { images: true, store: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    condition: p.condition,
    brand: p.brand,
    sizePxL: p.sizePxL,
    sizeLabel: p.sizeLabel,
    image: p.images.find((i) => !i.isDefect)?.url ?? p.images[0]?.url ?? null,
    storeName: p.store?.storeName ?? null,
    url: `/products/${p.id}`,
  }));
}

const TOOL_DEF = {
  type: "function" as const,
  function: {
    name: "searchProducts",
    description: "Cari produk katalog ThriftMarket yang AVAILABLE+APPROVED. Wajib dipanggil jika user mencari/minta rekomendasi produk.",
    parameters: {
      type: "object",
      properties: {
        q: { type: "string", description: "kata kunci judul/brand/deskripsi, mis. 'jaket denim'" },
        min: { type: "number", description: "harga minimum IDR" },
        max: { type: "number", description: "harga maksimum IDR" },
        condition: { type: "string", enum: ["LIKE_NEW", "GOOD", "FAIR"] },
        category: { type: "string", description: "categoryId jika user sebut kategori" },
      },
      required: [],
    },
  },
};

function fallbackSearchFromText(messages: { role: string; content: string }[]) {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const q = last.replace(/cari|rekomendasi|produk|tolong|carikan/gi, "").trim().slice(0, 60) || undefined;
  return q;
}

function stripMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^\s*[\*\-]\s+/gm, "- ")
    .replace(/\*/g, "");
}

export async function POST(req: NextRequest) {
  const ip = clientKey(req);
  const rl = rateLimit(`ai-chat:${ip}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak permintaan, coba lagi beberapa detik." }, { status: 429 });

  let parsed: z.infer<typeof schema>;
  try {
    const raw = await req.json();
    const cleaned = {
      messages: (Array.isArray(raw?.messages) ? raw.messages : [])
        .filter((m: unknown) => m && typeof (m as { content?: unknown }).content === "string")
        .map((m: { role?: string; content: string }) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content.trim().slice(0, 1000),
        }))
        .filter((m: { content: string }) => m.content.length > 0)
        .slice(-8),
    };
    parsed = schema.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Format pesan tidak valid." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";

  if (!apiKey) {
    const q = fallbackSearchFromText(parsed.messages);
    const products = await searchProducts({ q }).catch(() => []);
    const reply = products.length
      ? `Aku belum terhubung ke AI (GROQ_API_KEY kosong), tapi ini ${products.length} produk yang cocok dengan "${q ?? ""}". Klik untuk lihat detail. Untuk tanya FAQ: 1 item = 1 stok, foto defect wajib, ongkir flat Rp15.000, escrow Midtrans.`
      : `GROQ_API_KEY belum diatur. Coba kata kunci lain atau buka /products untuk jelajahi katalog. FAQ: stok tunggal, foto defect wajib, ongkir Rp15.000, escrow Midtrans.`;
    return NextResponse.json({ reply, products: products.slice(0, 3) });
  }

  try {
    const first = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 700,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...parsed.messages.map((m) => ({ role: m.role, content: m.content }))],
        tools: [TOOL_DEF],
        tool_choice: "auto",
      }),
    });

    if (!first.ok) {
      const t = await first.text().catch(() => "");
      const q = fallbackSearchFromText(parsed.messages);
      const products = await searchProducts({ q }).catch(() => []);
      return NextResponse.json({
        reply: `AI sedang sibuk (${first.status}). ${products.length ? `Sementara ini ada ${products.length} produk untuk "${q}".` : "Coba lagi atau buka /products."}`,
        products: products.slice(0, 3),
      });
    }

    const data = (await first.json()) as {
      choices: { message: { content: string | null; tool_calls?: { id: string; type: string; function: { name: string; arguments: string } }[] } }[];
    };
    const msg = data.choices?.[0]?.message;
    const toolCalls = msg?.tool_calls;

    if (!toolCalls?.length) {
      return NextResponse.json({ reply: stripMarkdown(msg?.content ?? "Maaf, belum ada jawaban. Coba tanya ulang."), products: [] });
    }

    const toolResults: { tool_call_id: string; name: string; products: Awaited<ReturnType<typeof searchProducts>> }[] = [];
    let mergedProducts: Awaited<ReturnType<typeof searchProducts>> = [];
    for (const tc of toolCalls) {
      if (tc.function.name !== "searchProducts") continue;
      let args: ToolArgs = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}");
      } catch {}
      const prods = await searchProducts(args);
      mergedProducts = prods;
      toolResults.push({ tool_call_id: tc.id, name: tc.function.name, products: prods });
    }

    const second = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...parsed.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "assistant", content: msg?.content ?? null, tool_calls: toolCalls },
          ...toolResults.map((r) => ({
            role: "tool" as const,
            tool_call_id: r.tool_call_id,
            content: JSON.stringify(r.products.length ? r.products.slice(0, 6) : { empty: true, hint: "Tidak ada produk cocok, sarankan kata kunci lain atau buka /products" }),
          })),
        ],
      }),
    });

    if (!second.ok) {
      return NextResponse.json({
        reply: mergedProducts.length ? `Menemukan ${mergedProducts.length} produk yang cocok — lihat kartu di bawah.` : "Tidak ada produk yang cocok, coba ubah kata kunci atau filter harga/kondisi.",
        products: mergedProducts.slice(0, 3),
      });
    }

    const data2 = (await second.json()) as { choices: { message: { content: string | null } }[] };
    const reply = stripMarkdown(data2.choices?.[0]?.message?.content ?? (mergedProducts.length ? `Menemukan ${mergedProducts.length} produk, cek di bawah.` : "Tidak ada produk cocok."));
    return NextResponse.json({ reply, products: mergedProducts.slice(0, 3) });
  } catch {
    return NextResponse.json({ error: "Gagal memproses chat AI." }, { status: 500 });
  }
}
