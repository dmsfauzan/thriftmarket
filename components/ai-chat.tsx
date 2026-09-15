"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bot, X, Send, Sparkles, Search } from "lucide-react";
import { formatIDR, conditionLabel } from "@/lib/utils";

type ChatMsg = { role: "user" | "assistant"; content: string };
type Prod = { id: string; title: string; price: number; condition: string; image: string | null; storeName: string | null; url: string };

const QUICK = ["Cari jaket denim", "Kondisi LIKE_NEW ada apa?", "Ongkir berapa?", "Cara jadi seller?"];

const GREETING: ChatMsg = { role: "assistant", content: "Hai! Aku asisten ThriftMarket — tanya katalog, kondisi, ukuran PxL, atau ongkir. Coba ketik ‘cari jaket’ atau pilih cepat di bawah." };

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([GREETING]);
  const [lastProds, setLastProds] = useState<Prod[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.removeItem("tm-ai-chat"); } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    setMsgs([GREETING]);
    setLastProds([]);
    try { localStorage.removeItem("tm-ai-chat"); } catch {}
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, lastProds, sending]);

  async function send(content?: string) {
    const text = (content ?? input).trim().slice(0, 500);
    if (!text || sending) return;
    let base = msgs.slice(-8);
    if (base.length >= 8) base = base.slice(-6);
    const next: ChatMsg[] = [...base, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setSending(true);
    setLastProds([]);
    try {
      const r = await fetch("/api/ai-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }) });
      const j = await r.json();
      if (!r.ok) {
        setMsgs((m) => [...m, { role: "assistant", content: (j?.error as string) ?? "Maaf, ada gangguan. Coba lagi." }]);
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: (j.reply as string) ?? "Siap!" }]);
        if (Array.isArray(j.products) && j.products.length) setLastProds(j.products as Prod[]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Koneksi bermasalah, coba lagi sebentar." }]);
    } finally { setSending(false); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Buka chat AI" className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 dark:bg-white dark:text-slate-900">
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 z-[60] flex h-[min(68vh,520px)] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 text-white dark:bg-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600"><Bot size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold">Asisten ThriftMarket <Sparkles size={12} className="text-amber-300" /></p>
              <p className="text-xs text-white/70">FAQ & cari katalog · Groq</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="tutup"><X size={16} /></button>
          </div>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100"}`}>{m.content}</p>
              </div>
            ))}
            {sending && <p className="rounded-2xl bg-white px-3.5 py-2.5 text-sm text-slate-400 shadow-sm dark:bg-slate-800">Mengetik…</p>}
            {lastProds.length > 0 && (
              <div className="space-y-2">
                {lastProds.map((p) => (
                  <Link key={p.id} href={p.url} onClick={() => setOpen(false)} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
                      {p.image ? <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized /> : <span className="flex h-full items-center justify-center text-slate-400"><Search size={18} /></span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{p.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{p.storeName ?? "ThriftMarket"} · {conditionLabel(p.condition)}</span>
                      <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatIDR(p.price)}</span>
                    </span>
                  </Link>
                ))}
                <Link href="/products" onClick={() => setOpen(false)} className="block text-center text-xs font-semibold text-slate-600 underline dark:text-slate-300">Lihat katalog lengkap →</Link>
              </div>
            )}
          </div>
          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} disabled={sending} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">{q}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Tanya katalog, mis. ‘cari hoodie hitam L’" maxLength={500} className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
              <button type="button" onClick={() => send()} disabled={sending || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white disabled:opacity-40 dark:bg-white dark:text-slate-900" aria-label="kirim"><Send size={16} /></button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">AI bisa salah — cek foto defect & PxL di halaman produk.</p>
          </div>
        </div>
      )}
    </>
  );
}
