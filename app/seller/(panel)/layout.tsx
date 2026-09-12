import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerShell } from "@/components/seller/shell";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId) redirect("/seller/login");
  if (role !== "SELLER") redirect("/");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { sellerStatus: true, store: { select: { approval: true } } } });
  if (!user || user.sellerStatus !== "APPROVED" || user.store?.approval !== "APPROVED") {
    redirect("/seller/pending");
  }
  return <SellerShell>{children}</SellerShell>;
}
