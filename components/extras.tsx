"use client";
import { useEffect, useState } from "react";
import { Heart, Bell, MessageCircle, Scale } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then((j) => setItems(Array.isArray(j) ? j : [])).catch(() => null);
  }, []);
  const unread = items.filter((x) => !x.isRead).length;
  async function readAll() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readAll: true }) });
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-full border border-slate-200 p-2.5 text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <Bell size={16} />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <b className="text-sm dark:text-white">Notifikasi</b>
            <button onClick={readAll} className="text-xs text-slate-500 dark:text-slate-400">Tandai dibaca</button>
          </div>
          {items.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">Belum ada notifikasi.</p> : (
            <ul className="space-y-2">
              {items.map((n) => (
                <li key={n.id} className={`rounded-xl p-3 text-sm ${n.isRead ? "bg-white dark:bg-slate-900" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                  <Link href={n.link ?? "#"} className="font-bold dark:text-white">{n.title}</Link>
                  {n.body && <p className="text-xs text-slate-500 dark:text-slate-400">{n.body}</p>}
                  <p className="text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleString("id-ID")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function WishlistButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    fetch("/api/wishlist").then((r) => r.json()).then((j) => {
      if (Array.isArray(j)) setSaved(j.some((x: any) => x.productId === productId || x.product?.id === productId));
      setChecked(true);
    }).catch(() => setChecked(true));
  }, [productId]);
  async function toggle() {
    await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    setSaved((v) => !v);
  }
  if (!checked) return null;
  return (
    <button onClick={toggle} aria-label="wishlist" className={`rounded-full border p-2.5 ${saved ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500"}`}>
      <Heart size={18} className={saved ? "fill-red-600" : ""} />
    </button>
  );
}

export function FollowButton({ storeId }: { storeId: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    fetch(`/api/follows?storeId=${storeId}`).then((r) => r.json()).then((j) => setOn(!!j.following)).catch(() => null);
  }, [storeId]);
  async function toggle() {
    const r = await fetch("/api/follows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId }) });
    const j = await r.json();
    setOn(!!j.following);
  }
  return (
    <button onClick={toggle} className={`rounded-full px-4 py-2 text-xs font-bold ${on ? "bg-slate-900 text-white" : "border border-slate-200 dark:border-slate-700 dark:text-white"}`}>
      {on ? "Mengikuti" : "Ikuti Toko"}
    </button>
  );
}

export function ChatButton({ storeId, storeName }: { storeId: string; storeName: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  async function send() {
    if (!body.trim()) return;
    await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeId, body }) });
    setBody(""); setOpen(false);
  }
  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold dark:border-slate-700 dark:text-white"><MessageCircle size={14} className="inline" /> Chat {storeName}</button>
      {open && (
        <div className="flex gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Halo, masih tersedia?" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={send} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Kirim</button>
        </div>
      )}
    </div>
  );
}

export function DisputeCta({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  async function submit() {
    const r = await fetch("/api/disputes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, reason, evidenceUrl: evidenceUrl || undefined }) });
    if (!r.ok) return alert((await r.json()).error ?? "Gagal");
    setOpen(false);
  }
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700"><Scale size={12} className="inline" /> Komplain {orderNumber}</button>
      {open && (
        <div className="mt-2 space-y-2 rounded-2xl border border-amber-200 p-3">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Jelaskan komplain (min 10 karakter)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={3} />
          <input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="Link foto bukti (opsional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={submit} className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white">Kirim Komplain</button>
        </div>
      )}
    </div>
  );
}
