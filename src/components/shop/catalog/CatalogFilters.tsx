"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { Check, X } from "lucide-react";
import { COLOR_FAMILIES } from "@/lib/colors";
import { formatNumber } from "@/lib/format";
import { GENDER_PARAMS, PRICE_RANGES } from "@/lib/catalog-filters";
import { buttonClass } from "@/lib/ui";
import type { Locale } from "@/lib/types";
import { useCatalog } from "./CatalogContext";

type Props = {
  brands: { slug: string; name: string }[];
  sizes: string[];
  lockedBrand?: boolean;
  activeCount: number;
  total: number;
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Desktop sidebar + mobile drawer with the same filter groups. */
export function CatalogFilters(props: Props) {
  const t = useTranslations("catalog");
  const { sidebarOpen, drawerOpen, setDrawerOpen } = useCatalog();

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <>
      {sidebarOpen && (
        <aside className="sticky top-36 hidden max-h-[calc(100svh-10rem)] w-64 shrink-0 overflow-y-auto pb-10 pr-2 lg:block" aria-label={t("filters")}>
          <FilterGroups {...props} />
        </aside>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("filters")}>
          <button type="button" className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setDrawerOpen(false)} aria-label="×" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88svh] animate-slide-up flex-col rounded-t-[2rem] bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-display text-lg font-semibold">{t("filters")}</p>
              <button type="button" onClick={() => setDrawerOpen(false)} className="flex size-10 items-center justify-center rounded-2xl hover:bg-sand" aria-label="×">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2">
              <FilterGroups {...props} />
            </div>
            <div className="border-t border-line p-4">
              <button type="button" onClick={() => setDrawerOpen(false)} className={buttonClass("primary", "lg", "w-full")}>
                {t("showResults")} · {props.total}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroups({ brands, sizes, lockedBrand, activeCount }: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { filters, update, reset } = useCatalog();

  return (
    <div className="divide-y divide-line">
      {activeCount > 0 && (
        <div className="pb-4">
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone underline-offset-4 hover:text-ink hover:underline">
            <X className="size-4" aria-hidden />
            {t("catalog.clear")} ({activeCount})
          </button>
        </div>
      )}

      <Group title={t("catalog.gender")}>
        {GENDER_PARAMS.map((g) => (
          <CheckRow key={g} checked={filters.genders.includes(g)} onChange={() => update({ genders: toggle(filters.genders, g) })}>
            {t(`gender.${g}`)}
          </CheckRow>
        ))}
      </Group>

      {!lockedBrand && brands.length > 0 && (
        <Group title={t("catalog.brand")}>
          {brands.map((b) => (
            <CheckRow key={b.slug} checked={filters.brands.includes(b.slug)} onChange={() => update({ brands: toggle(filters.brands, b.slug) })}>
              {b.name}
            </CheckRow>
          ))}
        </Group>
      )}

      <Group title={t("catalog.size")}>
        {sizes.length ? (
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => update({ sizes: toggle(filters.sizes, s) })}
                  className={clsx(
                    "h-10 rounded-xl border text-sm font-semibold transition-colors",
                    on ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                  )}
                  aria-pressed={on}
                >
                  {s}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-stone">{t("catalog.noSizes")}</p>
        )}
      </Group>

      <Group title={t("catalog.color")}>
        <div className="grid grid-cols-3 gap-x-2 gap-y-3">
          {COLOR_FAMILIES.map((c) => {
            const on = filters.colors.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => update({ colors: toggle(filters.colors, c.key) })}
                className="flex flex-col items-center gap-1.5 text-xs font-medium"
                aria-pressed={on}
              >
                <span
                  className={clsx(
                    "flex size-8 items-center justify-center rounded-full border transition-shadow",
                    on ? "ring-2 ring-ink ring-offset-2" : "border-line",
                  )}
                  style={{ background: c.hex }}
                >
                  {on && <Check className={clsx("size-4", ["white", "beige", "yellow"].includes(c.key) ? "text-ink" : "text-white")} aria-hidden />}
                </span>
                {locale === "uz" ? c.uz : c.ru}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title={t("catalog.price")}>
        {PRICE_RANGES.map((r) => (
          <CheckRow key={r.key} checked={filters.prices.includes(r.key)} onChange={() => update({ prices: toggle(filters.prices, r.key) })}>
            {r.max === null
              ? t("catalog.priceFrom", { min: formatNumber(r.min) })
              : r.min === 0
                ? t("catalog.priceUpTo", { max: formatNumber(r.max) })
                : `${formatNumber(r.min)} – ${formatNumber(r.max)}`}
          </CheckRow>
        ))}
      </Group>

      <Group title={t("nav.sale")}>
        <CheckRow checked={filters.sale} onChange={() => update({ sale: !filters.sale })}>
          {t("catalog.onSale")}
        </CheckRow>
        <CheckRow checked={filters.isNew} onChange={() => update({ isNew: !filters.isNew })}>
          {t("catalog.newOnly")}
        </CheckRow>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group py-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-semibold">
        {title}
        <svg className="size-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </summary>
      <div className="mt-3 space-y-1">{children}</div>
    </details>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl py-1.5 text-[15px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={clsx(
          "flex size-5 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-cobalt",
          checked ? "border-ink bg-ink text-white" : "border-line bg-white",
        )}
        aria-hidden
      >
        {checked && <Check className="size-3.5" />}
      </span>
      {children}
    </label>
  );
}
