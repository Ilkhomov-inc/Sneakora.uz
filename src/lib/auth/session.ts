import { jwtVerify, SignJWT } from "jose";

// Signed admin session token. Kept free of Next.js server APIs so proxy.ts can import it.
export const ADMIN_COOKIE = "sneakora_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = {
  sub: string; // "shared" for the common password; an AdminUser id once staff accounts are enabled
  role: "OWNER" | "MANAGER" | "EDITOR";
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signSession(session: AdminSession): Promise<string> {
  return new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    const role = payload.role === "MANAGER" || payload.role === "EDITOR" ? payload.role : "OWNER";
    return { sub: payload.sub, role };
  } catch {
    return null;
  }
}
