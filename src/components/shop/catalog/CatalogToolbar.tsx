"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { SORT_KEYS, type SortKey } from "@/lib/catalog-filters";
import { useCatalog } from "./CatalogContext";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "sortFeatured",
  newest: "sortNewest",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
};

export function CatalogToolbar({ title, total, activeCount }: { title: string; total: number; activeCount: number }) {
  const t = useTranslations("catalog");
  const { filters, update, sidebarOpen, setSidebarOpen, setDrawerOpen } = useCatalog();

  return (
    <div className="sticky top-16 z-20 -mx-4 mb-6 flex items-center justify-between gap-3 bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8 xl:-mx-12 xl:px-12">
      <div className="min-w-0">
        <h1 className="truncate font-display text-xl font-semibold md:text-2xl">{title}</h1>
        <p className="text-sm text-stone">{t("count", { count: total })}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-colors hover:bg-sand lg:flex"
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? t("hideFilters") : t("showFilters")}
          <SlidersHorizontal className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 items-center gap-2 rounded-2xl bg-sand px-4 text-sm font-semibold lg:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {t("filters")}
          {activeCount > 0 && <span className="rounded-lg bg-ink px-1.5 text-xs text-white">{activeCount}</span>}
        </button>
        <label className="relative">
          <span className="sr-only">{t("sort")}</span>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as SortKey })}
            className="h-11 appearance-none rounded-2xl bg-sand py-0 pl-4 pr-9 text-sm font-semibold outline-none transition-colors hover:bg-sand-deep"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(SORT_LABELS[key])}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </label>
      </div>
    </div>
  );
}
