import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch {
    /* notifikasi tidak boleh menggagalkan transaksi utama */
  }
}

export async function notifyMany(rows: Parameters<typeof notify>[0][]) {
  await Promise.all(rows.map((r) => notify(r)));
}
