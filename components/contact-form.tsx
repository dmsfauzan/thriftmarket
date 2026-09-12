"use client";
import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" />
        <input required placeholder="Email" type="email" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" />
      </div>
      <input required placeholder="Subject" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" />
      <textarea required placeholder="Message" rows={5} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" />
      <button className="w-full rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">Send Message</button>
      {sent && <p className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">Terima kasih! Pesanmu sudah terkirim.</p>}
    </form>
  );
}
