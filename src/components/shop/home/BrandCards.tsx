import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BannerMedia } from "@/components/ui/BannerMedia";
import { MediaSlideshow } from "@/components/ui/MediaSlideshow";
import { GENDER_PARAMS } from "@/lib/catalog-filters";
import { tr } from "@/lib/format";
import { isVideoUrl } from "@/lib/media";
import type { Locale } from "@/lib/types";
import { SectionHeading } from "../SectionHeading";

type BrandForCard = {
  slug: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerType: "IMAGE" | "VIDEO";
  bannerPosterUrl: string | null;
  cardMedia: string[];
  cardPosterUrl: string | null;
  textRu: string | null;
  textUz: string | null;
};

const SIZES = "(min-width: 768px) 33vw, 100vw";

/** Card background: the brand's vertical card media (video or slideshow), falling back to its banner. */
function CardMedia({ brand }: { brand: BrandForCard }) {
  const [first] = brand.cardMedia;
  if (first && isVideoUrl(first)) {
    return <BannerMedia type="VIDEO" src={first} poster={brand.cardPosterUrl} alt={brand.name} />;
  }
  if (brand.cardMedia.length > 1) return <MediaSlideshow images={brand.cardMedia} alt={brand.name} sizes={SIZES} />;
  if (first) return <BannerMedia type="IMAGE" src={first} alt={brand.name} sizes={SIZES} />;
  if (brand.bannerUrl) {
    return <BannerMedia type={brand.bannerType} src={brand.bannerUrl} poster={brand.bannerPosterUrl} alt={brand.name} sizes={SIZES} />;
  }
  return null;
}

/** The main sections of the store: one large card per brand. */
export async function BrandCards({ brands }: { brands: BrandForCard[] }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  if (!brands.length) return null;

  return (
    <section className="shell">
      <SectionHeading title={t("home.brandsTitle")} lead={t("home.brandsLead")} />
      <div className="grid gap-4 md:grid-cols-3">
        {brands.map((brand) => (
          <div key={brand.slug} className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[2rem] bg-ink p-5 text-white md:p-6">
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
              <CardMedia brand={brand} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
            <Link href={`/brand/${brand.slug}`} className="absolute inset-0 z-10" aria-label={brand.name} />

            <div className="relative flex items-start justify-between">
              <span className="flex h-12 items-center rounded-2xl bg-white px-4">
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- brand logos are small SVG/PNG files
                  <img src={brand.logoUrl} alt="" className="h-6 w-auto max-w-24" />
                ) : (
                  <span className="font-display text-sm font-bold text-ink">{brand.name}</span>
                )}
              </span>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur transition group-hover:bg-white group-hover:text-ink">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </div>

            <div className="relative">
              <h3 className="font-display text-3xl font-bold md:text-4xl">{brand.name}</h3>
              {tr(locale, brand.textRu, brand.textUz) && (
                <p className="mt-2 max-w-xs text-sm text-white/80">{tr(locale, brand.textRu, brand.textUz)}</p>
              )}
              <div className="relative z-20 mt-5 flex flex-wrap gap-2">
                {GENDER_PARAMS.map((g) => (
                  <Link
                    key={g}
                    href={`/brand/${brand.slug}?gender=${g}`}
                    className="rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-ink backdrop-blur transition-colors hover:bg-white"
                  >
                    {t(`gender.${g}`)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
