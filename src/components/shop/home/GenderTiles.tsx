import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { SectionHeading } from "../SectionHeading";

const TILES = [
  { key: "MEN", param: "men" },
  { key: "WOMEN", param: "women" },
  { key: "KIDS", param: "kids" },
] as const;

export async function GenderTiles({ covers }: { covers: Record<"MEN" | "WOMEN" | "KIDS", string | null> }) {
  const t = await getTranslations();
  return (
    <section className="shell">
      <SectionHeading title={t("home.forWhomTitle")} />
      <div className="grid gap-4 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            href={`/w?gender=${tile.param}`}
            className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-[2rem] bg-sand p-6"
          >
            {covers[tile.key] && (
              <SmartImage
                src={covers[tile.key]!}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <span className="relative z-10 font-display text-2xl font-semibold">{t(`gender.${tile.param}`)}</span>
            <span className="relative z-10 inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2 text-sm font-semibold transition-colors group-hover:bg-ink group-hover:text-white">
              {t("home.shop")}
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
