"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { isVideoUrl } from "@/lib/media";

export type FormState = { ok?: boolean; error?: string };

const optional = z.string().trim().max(1000).transform((v) => v || null);
const FIELDS = [
  "mediaUrl",
  "mediaUrlMobile",
  "posterUrl",
  "posterUrlMobile",
  "eyebrowRu",
  "eyebrowUz",
  "titleRu",
  "titleUz",
  "textRu",
  "textUz",
  "ctaLabelRu",
  "ctaLabelUz",
  "ctaHref",
  "sortOrder",
  "placement",
] as const;

const bannerSchema = z.object({
  placement: z.enum(["HERO", "PROMO"]),
  mediaUrl: z.string().trim().min(1, "Загрузите фото или видео").max(1000),
  mediaUrlMobile: optional,
  posterUrl: optional,
  posterUrlMobile: optional,
  eyebrowRu: optional,
  eyebrowUz: optional,
  titleRu: optional,
  titleUz: optional,
  textRu: optional,
  textUz: optional,
  ctaLabelRu: optional,
  ctaLabelUz: optional,
  ctaHref: optional,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export async function saveBanner(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const parsed = bannerSchema.safeParse({
    ...Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) ?? ""])),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  const data = { ...parsed.data, mediaType: isVideoUrl(parsed.data.mediaUrl) ? ("VIDEO" as const) : ("IMAGE" as const) };

  if (id) await db.banner.update({ where: { id }, data });
  else await db.banner.create({ data });
  revalidatePath("/", "layout");
  if (!id) redirect("/admin/banners");
  return { ok: true };
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await db.banner.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/banners");
}
