import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const action = searchParams.get("action");
  const sellerId = searchParams.get("sellerId");
  const take = Math.min(Number(searchParams.get("take") ?? 50), 200);

  const logs = await prisma.activityLog.findMany({
    where: {
      ...(q ? { message: { contains: q } } : {}),
      ...(action && action !== "ALL" ? { action: action as never } : {}),
      ...(sellerId ? { actorId: sellerId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  return NextResponse.json(logs);
}
