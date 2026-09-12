"use client";
import { useState } from "react";

export function ResubmitButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  async function resubmit() {
    setLoading(true);
    const r = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resubmit: true }),
    });
    setLoading(false);
    if (r.ok) location.reload();
    else setMsg("Gagal mengajukan ulang");
  }
  return (
    <div>
      <button onClick={resubmit} disabled={loading} className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60">
        {loading ? "..." : "Ajukan Ulang"}
      </button>
      {msg && <p className="text-[11px] text-red-600">{msg}</p>}
    </div>
  );
}
