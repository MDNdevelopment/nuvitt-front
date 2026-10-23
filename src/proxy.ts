import { NextResponse, type NextRequest } from "next/server";

/**
 * Chequeo OPTIMISTA del panel: solo mira si existe la cookie de sesión. La validación real
 * (token vigente y rol) la hacen el DAL (src/lib/admin/session.ts) y cada Server Action.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/admin/login");
  if (!isLogin && !request.cookies.has("nv_admin")) {
    return NextResponse.redirect(new URL("/admin/login/", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
