"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { isVideoUrl } from "@/lib/media";
import { slugify } from "@/lib/slug";

export type FormState = { ok?: boolean; error?: string };

const optional = z.string().trim().max(1000).transform((v) => v || null);

const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Укажите название").max(60),
  slug: z.string().trim().max(60),
  logoUrl: optional,
  bannerUrl: optional,
  bannerPosterUrl: optional,
  cardMedia: z.array(z.string().trim().min(1).max(1000)).max(12),
  cardPosterUrl: optional,
  titleRu: optional,
  titleUz: optional,
  textRu: optional,
  textUz: optional,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export async function saveBrand(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = brandSchema.safeParse({
    ...Object.fromEntries(
      ["id", "name", "slug", "logoUrl", "bannerUrl", "bannerPosterUrl", "cardPosterUrl", "titleRu", "titleUz", "textRu", "textUz", "sortOrder"].map((k) => [
        k,
        formData.get(k) ?? "",
      ]),
    ),
    cardMedia: formData.getAll("cardMedia").map(String).filter(Boolean),
    id: formData.get("id") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  const { id, ...b } = parsed.data;
  const slug = slugify(b.slug || b.name);
  if (!slug) return { error: "Укажите адрес (латиницей)" };

  const data = { ...b, slug, bannerType: b.bannerUrl && isVideoUrl(b.bannerUrl) ? ("VIDEO" as const) : ("IMAGE" as const) };
  try {
    if (id) await db.brand.update({ where: { id }, data });
    else await db.brand.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Бренд с таким адресом уже есть" };
    throw error;
  }
  revalidatePath("/", "layout");
  if (!id) redirect("/admin/brands");
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<FormState> {
  await requireAdmin();
  const products = await db.product.count({ where: { brandId: id } });
  if (products > 0) return { error: `У бренда ${products} товаров. Удалите их или перенесите в другой бренд, либо просто выключите бренд.` };
  await db.brand.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/brands");
}
