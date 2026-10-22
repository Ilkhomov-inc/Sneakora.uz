import { activeFilterCount, type CatalogFilters as Filters } from "@/lib/catalog-filters";
import { getAvailableSizes, getCatalog, getNavBrands } from "@/lib/catalog";
import { CatalogProvider } from "./CatalogContext";
import { CatalogToolbar } from "./CatalogToolbar";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogResults } from "./CatalogResults";

/** Product listing with filters. Used by /w (all products) and /brand/[slug]. */
export async function CatalogView({
  filters,
  basePath,
  title,
  brandSlug,
}: {
  filters: Filters;
  basePath: string;
  title: string;
  brandSlug?: string;
}) {
  const [{ items, total, hasMore }, sizes, brands] = await Promise.all([
    getCatalog(filters, brandSlug),
    getAvailableSizes(filters, brandSlug),
    getNavBrands(),
  ]);
  const activeCount = activeFilterCount(filters, Boolean(brandSlug));

  return (
    <CatalogProvider filters={filters} basePath={basePath}>
      <div className="shell">
        <CatalogToolbar title={title} total={total} activeCount={activeCount} />
        <div className="flex gap-10">
          <CatalogFilters brands={brands} sizes={sizes} lockedBrand={Boolean(brandSlug)} activeCount={activeCount} total={total} />
          <CatalogResults items={items} total={total} hasMore={hasMore} basePath={basePath} />
        </div>
      </div>
    </CatalogProvider>
  );
}
