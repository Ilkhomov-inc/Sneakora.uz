"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { GENDER_PARAMS } from "@/lib/catalog-filters";
import type { NavBrand } from "@/lib/types";

/** Drop-down under a brand in the desktop menu: Мужчинам / Женщинам / Детям / Все модели. */
export function MegaPanel({
  brand,
  onMouseEnter,
  onMouseLeave,
}: {
  brand: NavBrand;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const t = useTranslations();
  const cover = brand.bannerType === "IMAGE" ? brand.bannerUrl : brand.bannerPosterUrl;

  return (
    <div
      className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-line bg-white shadow-[0_24px_48px_-24px_rgba(18,18,18,0.25)] lg:block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grid grid-cols-[1fr_1.4fr] gap-10 px-12 py-8">
        <div className="flex flex-col justify-between">
          <div>
            {brand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- logos are small SVGs from the admin
              <img src={brand.logoUrl} alt="" className="mb-5 h-8 w-auto" />
            )}
            <ul className="space-y-1">
              {GENDER_PARAMS.map((g) => (
                <li key={g}>
                  <Link
                    href={`/brand/${brand.slug}?gender=${g}`}
                    className="group inline-flex items-center gap-3 font-display text-2xl font-semibold transition-colors hover:text-cobalt"
                  >
                    {t(`gender.${g}`)}
                    <ArrowRight className="size-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href={`/brand/${brand.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
            {t("nav.allModels", { brand: brand.name })}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {cover && (
          <Link href={`/brand/${brand.slug}`} className="relative block h-56 overflow-hidden rounded-3xl bg-sand" tabIndex={-1}>
            <SmartImage src={cover} alt={brand.name} fill sizes="50vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
          </Link>
        )}
      </div>
    </div>
  );
}
