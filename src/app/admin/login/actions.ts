"use server";

import { redirect } from "next/navigation";
import { checkCredentials, endSession, startSession } from "@/lib/auth/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!rateLimit(`login:${await clientIp()}`, 8, 15 * 60 * 1000)) {
    return { error: "Слишком много попыток. Подождите 15 минут." };
  }
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD не задан на сервере (.env)." };

  const session = await checkCredentials(String(formData.get("password") ?? ""));
  if (!session) return { error: "Неверный пароль" };

  await startSession(session);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
