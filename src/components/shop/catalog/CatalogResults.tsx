"use client";

import { useTranslations } from "next-intl";
import clsx from "clsx";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { filtersToSearchParams } from "@/lib/catalog-filters";
import { buttonClass } from "@/lib/ui";
import type { ProductCardData } from "@/lib/types";
import { ProductCard } from "../ProductCard";
import { useCatalog } from "./CatalogContext";

export function CatalogResults({
  items,
  total,
  hasMore,
  basePath,
}: {
  items: ProductCardData[];
  total: number;
  hasMore: boolean;
  basePath: string;
}) {
  const t = useTranslations("catalog");
  const { filters, pending, sidebarOpen, reset } = useCatalog();

  if (!items.length) {
    return (
      <div className={clsx("flex-1 py-20 text-center transition-opacity", pending && "opacity-50")}>
        <SearchX className="mx-auto size-10 text-stone" aria-hidden />
        <p className="mt-4 font-display text-xl font-semibold">{t("empty")}</p>
        <p className="mt-2 text-stone">{t("emptyHint")}</p>
        <button type="button" onClick={reset} className={buttonClass("outline", "md", "mt-6")}>
          {t("clear")}
        </button>
      </div>
    );
  }

  const nextQuery = filtersToSearchParams({ ...filters, page: filters.page + 1 }).toString();

  return (
    <div className={clsx("min-w-0 flex-1 transition-opacity", pending && "pointer-events-none opacity-50")} aria-busy={pending}>
      <div className={clsx("grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-4", sidebarOpen ? "md:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4")}>
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
      <div className="mt-12 flex flex-col items-center gap-3">
        <p className="text-sm text-stone">{t("shown", { shown: items.length, total })}</p>
        {hasMore && (
          <Link href={`${basePath}?${nextQuery}`} scroll={false} className={buttonClass("outline", "lg")}>
            {t("loadMore")}
          </Link>
        )}
      </div>
    </div>
  );
}
