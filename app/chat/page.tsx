"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const sp = useSearchParams();
  const [convs, setConvs] = useState<any[]>([]);
  const [cid, setCid] = useState(sp.get("cid") ?? "");
  const [msgs, setMsgs] = useState<any[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/api/messages").then((r) => r.json()).then((j) => {
      if (Array.isArray(j)) {
        setConvs(j);
        if (!cid && j[0]) setCid(j[0].id);
      }
    }).catch(() => null);
  }, []);

  useEffect(() => {
    if (!cid) return;
    const t = setInterval(() => {
      fetch(`/api/messages?conversationId=${cid}`).then((r) => r.json()).then((j) => {
        if (Array.isArray(j)) setMsgs(j);
      }).catch(() => null);
    }, 3000);
    return () => clearInterval(t);
  }, [cid]);

  async function send() {
    if (!body.trim() || !cid) return;
    const r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: cid, body }) });
    if (r.ok) {
      setBody("");
      const j = await fetch(`/api/messages?conversationId=${cid}`).then((x) => x.json());
      if (Array.isArray(j)) setMsgs(j);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8 md:grid-cols-[280px_1fr]">
      <aside className="space-y-2 rounded-2xl border border-sand-line bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <b className="text-sm dark:text-white">Percakapan</b>
        {convs.map((c) => (
          <button key={c.id} onClick={() => setCid(c.id)} className={`w-full rounded-xl p-3 text-left text-sm ${cid === c.id ? "bg-slate-900 text-white" : "hover:bg-slate-50 dark:text-white"}`}>
            {c.store?.storeName} — {c.buyer?.name}
            <p className="truncate text-xs opacity-70">{c.messages?.[0]?.body ?? ""}</p>
          </button>
        ))}
        {convs.length === 0 && <p className="text-xs text-slate-400">Belum ada chat.</p>}
      </aside>
      <div className="flex min-h-[480px] flex-col rounded-2xl border border-sand-line bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {msgs.map((m) => (
            <p key={m.id} className="max-w-[75%] rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800 dark:text-white">{m.body}</p>
          ))}
          {msgs.length === 0 && <p className="text-sm text-slate-400">Pilih percakapan untuk mulai chat.</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tulis pesan..." className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={send} className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white">Kirim</button>
        </div>
      </div>
    </div>
  );
}
