import { auth } from "@/lib/auth";

const SELLER_PUBLIC = ["/seller/login", "/seller/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const logged = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isSellerPanel = pathname.startsWith("/seller") && !SELLER_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/")) && pathname !== "/seller/pending";
  const isCheckoutPath = pathname.startsWith("/checkout");
  const isPrivateBuyerPath = ["/chat", "/wishlist"].some((p) => pathname === p || pathname.startsWith(p + "/"));

  if ((isSellerPanel || isCheckoutPath || isAdminPath || isPrivateBuyerPath) && !logged) {
    if (isAdminPath) return Response.redirect(new URL("/admin/login", req.nextUrl));
    if (isSellerPanel) return Response.redirect(new URL("/seller/login", req.nextUrl));
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  if (isSellerPanel && role !== "SELLER") {
    return Response.redirect(new URL("/", req.nextUrl));
  }
  if (isAdminPath && role !== "ADMIN") {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = { matcher: ["/seller/:path*", "/checkout/:path*", "/admin/:path*", "/chat/:path*", "/wishlist/:path*"] };
