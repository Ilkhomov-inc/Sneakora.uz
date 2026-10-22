import "server-only";
import { cache } from "react";
import type { Gender as DbGender, Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { compareSizes } from "./sizes";
import { PAGE_SIZE, PRICE_RANGES, type CatalogFilters, type GenderParam } from "./catalog-filters";
import type { NavBrand, ProductCardData } from "./types";

const GENDER_MAP: Record<GenderParam, DbGender[]> = {
  men: ["MEN", "UNISEX"],
  women: ["WOMEN", "UNISEX"],
  kids: ["KIDS"],
};

export const cardSelect = {
  id: true,
  slug: true,
  name: true,
  gender: true,
  price: true,
  salePrice: true,
  isNew: true,
  brand: { select: { name: true } },
  variants: {
    orderBy: { sortOrder: "asc" },
    select: { sku: true, colorHex: true, images: true },
  },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export function toCard(row: CardRow): ProductCardData {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brand.name,
    gender: row.gender,
    price: row.price,
    salePrice: row.salePrice,
    isNew: row.isNew,
    colors: row.variants.map((v) => ({
      sku: v.sku,
      hex: v.colorHex,
      image: v.images[0] ?? null,
      hoverImage: v.images[1] ?? null,
    })),
  };
}

/** Products everyone may see: published, of an active brand. */
const visible = { isPublished: true, brand: { isActive: true } } satisfies Prisma.ProductWhereInput;

export function buildWhere(filters: CatalogFilters, brandSlug?: string): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [visible];

  const brands = brandSlug ? [brandSlug] : filters.brands;
  if (brands.length) and.push({ brand: { slug: { in: brands } } });
  if (filters.genders.length) and.push({ gender: { in: [...new Set(filters.genders.flatMap((g) => GENDER_MAP[g]))] } });
  if (filters.sale) and.push({ salePrice: { not: null } });
  if (filters.isNew) and.push({ isNew: true });

  // Size and colour must match the same colourway (a black pair in size 42, not "black" + "42" elsewhere).
  if (filters.sizes.length || filters.colors.length) {
    and.push({
      variants: {
        some: {
          ...(filters.colors.length ? { colorFamily: { in: filters.colors } } : {}),
          ...(filters.sizes.length ? { sizes: { some: { size: { in: filters.sizes }, stock: { gt: 0 } } } } : {}),
        },
      },
    });
  }

  if (filters.prices.length) {
    and.push({
      OR: PRICE_RANGES.filter((r) => filters.prices.includes(r.key)).map((r) => ({
        finalPrice: { gte: r.min, ...(r.max !== null ? { lte: r.max } : {}) },
      })),
    });
  }

  if (filters.q) {
    const contains = { contains: filters.q, mode: "insensitive" as const };
    and.push({
      OR: [{ name: contains }, { brand: { name: contains } }, { variants: { some: { sku: contains } } }],
    });
  }

  return { AND: and };
}

const ORDER_BY: Record<CatalogFilters["sort"], Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { createdAt: "desc" }, { id: "asc" }],
  newest: [{ createdAt: "desc" }, { id: "asc" }],
  "price-asc": [{ finalPrice: "asc" }, { id: "asc" }],
  "price-desc": [{ finalPrice: "desc" }, { id: "asc" }],
};

export async function getCatalog(filters: CatalogFilters, brandSlug?: string) {
  const where = buildWhere(filters, brandSlug);
  const take = PAGE_SIZE * filters.page;
  const [rows, total] = await Promise.all([
    db.product.findMany({ where, orderBy: ORDER_BY[filters.sort], take, select: cardSelect }),
    db.product.count({ where }),
  ]);
  return { items: rows.map(toCard), total, hasMore: total > rows.length };
}

/** Sizes that are in stock among the products matching the brand/gender context of the page. */
export async function getAvailableSizes(filters: CatalogFilters, brandSlug?: string): Promise<string[]> {
  const scope = buildWhere({ ...filters, sizes: [], colors: [], prices: [], q: "", sale: false, isNew: false }, brandSlug);
  const rows = await db.variantSize.findMany({
    where: { stock: { gt: 0 }, variant: { product: scope } },
    distinct: ["size"],
    select: { size: true },
  });
  return rows.map((r) => r.size).sort(compareSizes);
}

export const getNavBrands = cache(async (): Promise<NavBrand[]> => {
  return db.brand.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { slug: true, name: true, logoUrl: true, bannerUrl: true, bannerType: true, bannerPosterUrl: true },
  });
});

export const getBrand = cache(async (slug: string) => {
  return db.brand.findFirst({ where: { slug, isActive: true } });
});

export async function getProductRail(kind: "new" | "featured" | "sale", limit = 12) {
  const where: Prisma.ProductWhereInput =
    kind === "new" ? { ...visible, isNew: true } : kind === "featured" ? { ...visible, isFeatured: true } : { ...visible, salePrice: { not: null } };
  const rows = await db.product.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export const getProduct = cache(async (slug: string) => {
  return db.product.findFirst({
    where: { slug, ...visible },
    include: {
      brand: { select: { name: true, slug: true, logoUrl: true } },
      variants: {
        orderBy: { sortOrder: "asc" },
        include: { sizes: true },
      },
    },
  });
});

export async function getRelatedProducts(product: { id: string; gender: DbGender; brandId: string }, limit = 12) {
  const rows = await db.product.findMany({
    where: {
      ...visible,
      id: { not: product.id },
      OR: [{ brandId: product.brandId }, { gender: product.gender }],
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

/** One representative photo per gender for the home page tiles. */
export async function getGenderCovers(): Promise<Record<"MEN" | "WOMEN" | "KIDS", string | null>> {
  const pick = async (genders: DbGender[]) => {
    const row = await db.product.findFirst({
      where: { ...visible, gender: { in: genders } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: { variants: { orderBy: { sortOrder: "asc" }, take: 1, select: { images: true } } },
    });
    return row?.variants[0]?.images[0] ?? null;
  };
  const [men, women, kids] = await Promise.all([pick(["MEN"]), pick(["WOMEN"]), pick(["KIDS"])]);
  return { MEN: men, WOMEN: women, KIDS: kids };
}

export async function getBanners(placement: "HERO" | "PROMO") {
  return db.banner.findMany({
    where: { placement, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getBrandsWithCovers() {
  return db.brand.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
