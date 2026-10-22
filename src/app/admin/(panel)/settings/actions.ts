"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { SETTING_FIELDS } from "@/lib/settings";

export type FormState = { ok?: boolean; error?: string };

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = SETTING_FIELDS.map(({ key }) => {
    let value = String(formData.get(key) ?? "").trim().slice(0, 2000);
    if (key === "telegramUsername" || key === "instagram") {
      value = value.replace(/^https?:\/\/(t\.me|instagram\.com|www\.instagram\.com)\//, "").replace(/^@/, "").replace(/\/$/, "");
    }
    return { key, value };
  });
  const telegram = values.find((v) => v.key === "telegramUsername")?.value ?? "";
  if (telegram && !/^[A-Za-z0-9_]{4,32}$/.test(telegram)) {
    return { error: "Telegram username: латинские буквы, цифры и _, от 4 символов" };
  }
  await db.$transaction(values.map(({ key, value }) => db.setting.upsert({ where: { key }, update: { value }, create: { key, value } })));
  revalidatePath("/", "layout");
  return { ok: true };
}
