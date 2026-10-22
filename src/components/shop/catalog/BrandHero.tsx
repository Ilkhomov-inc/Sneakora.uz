import { getLocale, getTranslations } from "next-intl/server";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { BannerMedia } from "@/components/ui/BannerMedia";
import { GENDER_PARAMS, type GenderParam } from "@/lib/catalog-filters";
import { tr } from "@/lib/format";
import type { Locale } from "@/lib/types";

type Brand = {
  slug: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerType: "IMAGE" | "VIDEO";
  bannerPosterUrl: string | null;
  titleRu: string | null;
  titleUz: string | null;
  textRu: string | null;
  textUz: string | null;
};

export async function BrandHero({ brand, activeGender }: { brand: Brand; activeGender: GenderParam | null }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const text = tr(locale, brand.textRu, brand.textUz);

  return (
    <section className="shell">
      <div className="relative flex min-h-[340px] items-end overflow-hidden rounded-[2rem] bg-ink text-white md:min-h-[420px]">
        {brand.bannerUrl && (
          <BannerMedia type={brand.bannerType} src={brand.bannerUrl} poster={brand.bannerPosterUrl} alt={brand.name} priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="relative w-full p-6 md:p-10">
          {brand.logoUrl && (
            <span className="mb-5 inline-flex h-14 items-center rounded-2xl bg-white px-5">
              {/* eslint-disable-next-line @next/next/no-img-element -- brand logos are small SVG/PNG files */}
              <img src={brand.logoUrl} alt={brand.name} className="h-7 w-auto max-w-28" />
            </span>
          )}
          <h1 className="font-display text-4xl font-bold md:text-6xl">{tr(locale, brand.titleRu, brand.titleUz) || brand.name}</h1>
          {text && <p className="mt-3 max-w-xl text-white/85 md:text-lg">{text}</p>}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label={brand.name}>
            <Chip href={`/brand/${brand.slug}`} active={!activeGender}>
              {t("nav.allModels", { brand: brand.name })}
            </Chip>
            {GENDER_PARAMS.map((g) => (
              <Chip key={g} href={`/brand/${brand.slug}?gender=${g}`} active={activeGender === g}>
                {t(`gender.${g}`)}
              </Chip>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={clsx(
        "rounded-xl px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors",
        active ? "bg-white text-ink" : "bg-white/15 text-white hover:bg-white/25",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
