import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type AdminSession } from "./session";

// Admin sign-in. Today: one shared password from ADMIN_PASSWORD.
// Staff accounts later: look the user up in the AdminUser table in `checkCredentials`
// and put their id and role into the session. Nothing else has to change.

export async function checkCredentials(password: string): Promise<AdminSession | null> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return null;
  const a = createHash("sha256").update(password).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) ? { sub: "shared", role: "OWNER" } : null;
}

export async function startSession(session: AdminSession) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, await signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

/** Use at the top of every admin page, server action and admin API route. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
