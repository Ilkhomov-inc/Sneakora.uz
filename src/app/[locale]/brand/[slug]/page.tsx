import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBrand } from "@/lib/catalog";
import { parseFilters } from "@/lib/catalog-filters";
import { tr } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { CatalogView } from "@/components/shop/catalog/CatalogView";
import { BrandHero } from "@/components/shop/catalog/BrandHero";

export async function generateMetadata({ params }: PageProps<"/[locale]/brand/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};
  return {
    title: brand.name,
    description: tr(locale as Locale, brand.textRu, brand.textUz) || undefined,
  };
}

export default async function BrandPage({ params, searchParams }: PageProps<"/[locale]/brand/[slug]">) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const t = await getTranslations();
  const filters = parseFilters(await searchParams);
  const gender = filters.genders.length === 1 ? filters.genders[0] : null;
  const title = gender ? `${brand.name} · ${t(`gender.${gender}`)}` : brand.name;

  return (
    <div className="space-y-8 pt-4">
      <BrandHero brand={brand} activeGender={gender} />
      <CatalogView filters={filters} basePath={`/brand/${brand.slug}`} title={title} brandSlug={brand.slug} />
    </div>
  );
}
