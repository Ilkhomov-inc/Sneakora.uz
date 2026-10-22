// Fills an empty database with temporary catalog content (brands, banners, products).
// Run: npm run db:seed. To replace existing catalog data: SEED_RESET=1 npm run db:seed
// (orders and settings are never touched).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Gender, type MediaType, type BannerPlacement } from "../src/generated/prisma/client";

type SeedData = {
  brands: {
    slug: string;
    name: string;
    logoUrl: string;
    sortOrder: number;
    bannerUrl: string;
    bannerType: MediaType;
    bannerPosterUrl: string | null;
    cardMedia?: string[];
    cardPosterUrl?: string | null;
    titleRu: string;
    titleUz: string;
    textRu: string;
    textUz: string;
  }[];
  banners: {
    placement: BannerPlacement;
    sortOrder: number;
    mediaType: MediaType;
    mediaUrl: string;
    mediaUrlMobile: string | null;
    posterUrl: string | null;
    posterUrlMobile: string | null;
    eyebrowRu: string;
    eyebrowUz: string;
    titleRu: string;
    titleUz: string;
    textRu: string;
    textUz: string;
    ctaLabelRu: string;
    ctaLabelUz: string;
    ctaHref: string;
  }[];
  products: {
    brand: string;
    name: string;
    slug: string;
    gender: Gender;
    price: number;
    salePrice: number | null;
    isNew: boolean;
    isFeatured: boolean;
    descriptionRu: string;
    descriptionUz: string;
    variants: {
      sku: string;
      colorNameRu: string;
      colorNameUz: string;
      colorFamily: string;
      colorHex: string;
      images: string[];
      sizes: { size: string; stock: number }[];
    }[];
  }[];
};

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const data: SeedData = JSON.parse(readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

async function main() {
  const existing = await db.brand.count();
  if (existing > 0 && !process.env.SEED_RESET) {
    console.log("Catalog already has data, nothing to do. Use SEED_RESET=1 to replace it.");
    return;
  }
  if (process.env.SEED_RESET) {
    await db.product.deleteMany();
    await db.brand.deleteMany();
    await db.banner.deleteMany();
  }

  const brandIds = new Map<string, string>();
  for (const brand of data.brands) {
    const created = await db.brand.create({ data: brand });
    brandIds.set(brand.slug, created.id);
  }

  for (const banner of data.banners) {
    await db.banner.create({ data: banner });
  }

  // Older products first so that `createdAt desc` puts the list's head on top.
  const products = [...data.products].reverse();
  for (const p of products) {
    await db.product.create({
      data: {
        slug: p.slug,
        brandId: brandIds.get(p.brand)!,
        gender: p.gender,
        name: p.name,
        descriptionRu: p.descriptionRu,
        descriptionUz: p.descriptionUz,
        price: p.price,
        salePrice: p.salePrice,
        finalPrice: p.salePrice ?? p.price,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        variants: {
          create: p.variants.map((v, index) => ({
            sku: v.sku,
            colorNameRu: v.colorNameRu,
            colorNameUz: v.colorNameUz,
            colorFamily: v.colorFamily,
            colorHex: v.colorHex,
            images: v.images,
            sortOrder: index,
            sizes: { create: v.sizes },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${data.brands.length} brands, ${data.banners.length} banners, ${data.products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
