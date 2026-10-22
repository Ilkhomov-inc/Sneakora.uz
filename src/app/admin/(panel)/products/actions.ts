"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { COLOR_KEYS } from "@/lib/colors";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { ADULT_SIZES, KIDS_SIZES } from "@/lib/sizes";

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "Укажите артикул").max(60),
  colorNameRu: z.string().trim().min(1, "Укажите цвет (RU)").max(80),
  colorNameUz: z.string().trim().max(80),
  colorFamily: z.string().refine((v) => COLOR_KEYS.includes(v), "Выберите цвет для фильтра"),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Цвет в формате #RRGGBB"),
  images: z.array(z.string().trim().min(1).max(1000)).max(20),
  sizes: z.record(z.string(), z.number().int().min(0).max(9999)),
});

const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Укажите название").max(120),
    slug: z.string().trim().max(80),
    brandId: z.string().min(1, "Выберите бренд"),
    gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
    price: z.number().int().positive("Укажите цену"),
    salePrice: z.number().int().positive().nullable(),
    descriptionRu: z.string().max(5000),
    descriptionUz: z.string().max(5000),
    isNew: z.boolean(),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
    variants: z.array(variantSchema).min(1, "Добавьте хотя бы одну расцветку").max(30),
  })
  .refine((p) => p.salePrice === null || p.salePrice < p.price, { message: "Цена со скидкой должна быть меньше обычной", path: ["salePrice"] });

export type ProductInput = z.input<typeof productSchema>;
export type SaveResult = { ok: true; id: string; variantIds: string[] } | { ok: false; error: string };

export async function saveProduct(input: ProductInput): Promise<SaveResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  const p = parsed.data;

  const grid = p.gender === "KIDS" ? KIDS_SIZES : ADULT_SIZES;
  const slug = slugify(p.slug || p.name);
  if (!slug) return { ok: false, error: "Не удалось составить адрес страницы из названия — укажите его вручную" };

  const data = {
    slug,
    name: p.name,
    brandId: p.brandId,
    gender: p.gender,
    price: p.price,
    salePrice: p.salePrice,
    finalPrice: p.salePrice ?? p.price,
    descriptionRu: p.descriptionRu,
    descriptionUz: p.descriptionUz,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    isPublished: p.isPublished,
  };

  const sizeRows = (sizes: Record<string, number>) =>
    Object.entries(sizes)
      .filter(([size]) => grid.includes(size))
      .map(([size, stock]) => ({ size, stock }));

  try {
    const saved = await db.$transaction(async (tx) => {
      const product = p.id ? await tx.product.update({ where: { id: p.id }, data }) : await tx.product.create({ data });
      const keep = p.variants.filter((v) => v.id).map((v) => v.id!);
      await tx.productVariant.deleteMany({ where: { productId: product.id, id: { notIn: keep } } });

      const variantIds: string[] = [];
      for (const [index, v] of p.variants.entries()) {
        const fields = {
          sku: v.sku,
          colorNameRu: v.colorNameRu,
          colorNameUz: v.colorNameUz || v.colorNameRu,
          colorFamily: v.colorFamily,
          colorHex: v.colorHex,
          images: v.images,
          sortOrder: index,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id, productId: product.id }, data: fields });
          await tx.variantSize.deleteMany({ where: { variantId: v.id } });
          await tx.variantSize.createMany({ data: sizeRows(v.sizes).map((s) => ({ ...s, variantId: v.id! })) });
          variantIds.push(v.id);
        } else {
          const created = await tx.productVariant.create({ data: { ...fields, productId: product.id, sizes: { create: sizeRows(v.sizes) } } });
          variantIds.push(created.id);
        }
      }
      return { id: product.id, variantIds };
    });
    revalidatePath("/", "layout");
    return { ok: true, ...saved };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // With driver adapters the constraint fields are nested in `meta`; search the whole object.
      const isSku = JSON.stringify(error.meta ?? {}).includes("sku");
      return { ok: false, error: isSku ? "Такой артикул уже есть у другого товара" : "Такой адрес страницы уже занят — измените его" };
    }
    throw error;
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function setProductPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { isPublished } });
  revalidatePath("/", "layout");
}
