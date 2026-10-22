import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { parseFilters } from "@/lib/catalog-filters";
import { CatalogView } from "@/components/shop/catalog/CatalogView";

async function pageTitle(searchParams: PageProps<"/[locale]/w">["searchParams"]) {
  const t = await getTranslations("catalog");
  const filters = parseFilters(await searchParams);
  if (filters.q) return t("searchTitle", { q: filters.q });
  if (filters.sale) return t("saleTitle");
  if (filters.isNew) return t("newTitle");
  return t("title");
}

export async function generateMetadata({ searchParams }: PageProps<"/[locale]/w">): Promise<Metadata> {
  return { title: await pageTitle(searchParams) };
}

export default async function CatalogPage({ params, searchParams }: PageProps<"/[locale]/w">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const filters = parseFilters(await searchParams);

  return (
    <div className="pt-2">
      <CatalogView filters={filters} basePath="/w" title={await pageTitle(searchParams)} />
    </div>
  );
}
