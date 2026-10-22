import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBanners, getBrandsWithCovers, getGenderCovers, getProductRail } from "@/lib/catalog";
import { getSettings, telegramChatUrl } from "@/lib/settings";
import { tr } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { HeroSlider, type HeroSlide } from "@/components/shop/home/HeroSlider";
import { BrandCards } from "@/components/shop/home/BrandCards";
import { GenderTiles } from "@/components/shop/home/GenderTiles";
import { PromoBanners, type PromoBannerData } from "@/components/shop/home/PromoBanners";
import { HelpBlock } from "@/components/shop/home/HelpBlock";
import { ProductRail } from "@/components/shop/ProductRail";

type BannerRow = Awaited<ReturnType<typeof getBanners>>[number];

function localizeBanner(b: BannerRow, locale: Locale): HeroSlide & PromoBannerData {
  return {
    id: b.id,
    mediaType: b.mediaType,
    mediaUrl: b.mediaUrl,
    mediaUrlMobile: b.mediaUrlMobile,
    posterUrl: b.posterUrl,
    posterUrlMobile: b.posterUrlMobile,
    eyebrow: tr(locale, b.eyebrowRu, b.eyebrowUz),
    title: tr(locale, b.titleRu, b.titleUz),
    text: tr(locale, b.textRu, b.textUz),
    ctaLabel: tr(locale, b.ctaLabelRu, b.ctaLabelUz),
    ctaHref: b.ctaHref,
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, hero, promo, brands, newProducts, featured, covers, settings] = await Promise.all([
    getTranslations("home"),
    getBanners("HERO"),
    getBanners("PROMO"),
    getBrandsWithCovers(),
    getProductRail("new"),
    getProductRail("featured"),
    getGenderCovers(),
    getSettings(),
  ]);

  return (
    <div className="space-y-20 md:space-y-28">
      <HeroSlider slides={hero.map((b) => localizeBanner(b, locale))} />
      <BrandCards brands={brands} />
      <div className="shell">
        <ProductRail title={t("newTitle")} href="/w?new=1" linkLabel={t("newLink")} products={newProducts} />
      </div>
      <GenderTiles covers={covers} />
      <div className="shell">
        <ProductRail title={t("featuredTitle")} href="/w" linkLabel={t("featuredLink")} products={featured} />
      </div>
      <PromoBanners banners={promo.map((b) => localizeBanner(b, locale))} />
      <HelpBlock telegramUrl={telegramChatUrl(settings.telegramUsername)} />
    </div>
  );
}
