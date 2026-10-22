import { getLocale } from "next-intl/server";
import { getNavBrands } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { tr } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { HeaderBar } from "./HeaderBar";
import { PromoBar } from "./PromoBar";

export async function SiteHeader() {
  const [locale, brands, settings] = await Promise.all([getLocale() as Promise<Locale>, getNavBrands(), getSettings()]);
  const promo = tr(locale, settings.promoRu, settings.promoUz)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      {promo.length > 0 && <PromoBar messages={promo} />}
      <HeaderBar brands={brands} />
    </>
  );
}
