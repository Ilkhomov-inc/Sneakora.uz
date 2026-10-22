import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [brands, products] = await Promise.all([
    db.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { isPublished: true, brand: { isActive: true } }, select: { slug: true, updatedAt: true } }),
  ]);

  const entry = (path: string, lastModified?: Date): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified,
    alternates: { languages: { ru: `${base}${path}`, uz: `${base}/uz${path === "/" ? "" : path}` } },
  });

  return [
    entry("/"),
    entry("/w"),
    ...brands.map((b) => entry(`/brand/${b.slug}`, b.updatedAt)),
    ...products.map((p) => entry(`/t/${p.slug}`, p.updatedAt)),
  ];
}
