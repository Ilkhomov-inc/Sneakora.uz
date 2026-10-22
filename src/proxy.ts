import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_COOKIE, verifySession } from "./lib/auth/session";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin panel: not localized; an optimistic session check (every admin page/action checks again).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifySession(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!session) return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.next();
  }

  return intl(request);
}

export const config = {
  // Everything except API routes, uploaded files, Next.js internals and files with an extension.
  matcher: ["/((?!api|uploads|_next|_vercel|.*\\..*).*)"],
};
