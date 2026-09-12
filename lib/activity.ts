import { prisma } from "@/lib/prisma";

type Role = "BUYER" | "SELLER" | "ADMIN";

export async function logActivity(input: {
  action:
    | "SELLER_REGISTER"
    | "SELLER_APPROVED"
    | "SELLER_REJECTED"
    | "PRODUCT_CREATE"
    | "PRODUCT_UPDATE"
    | "PRODUCT_RESUBMIT"
    | "PRODUCT_APPROVED"
    | "PRODUCT_REJECTED"
    | "ORDER_SHIPPED"
    | "STORE_UPDATE";
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: Role | null;
  message: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
        actorRole: input.actorRole ?? null,
        message: input.message,
        targetId: input.targetId ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch {
    /* logging tidak boleh menggagalkan transaksi utama */
  }
}
