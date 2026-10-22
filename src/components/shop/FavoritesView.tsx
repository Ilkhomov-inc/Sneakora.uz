"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useMounted } from "@/hooks/useMounted";
import { buttonClass } from "@/lib/ui";
import { useFavorites } from "@/stores/favorites";
import { ProductCard } from "./ProductCard";

export function FavoritesView() {
  const t = useTranslations();
  const mounted = useMounted();
  const items = useFavorites((s) => s.items);

  if (!mounted) return <div className="shell min-h-[50vh] py-10" aria-busy="true" />;

  return (
    <div className="shell py-8 lg:py-12">
      <h1 className="font-display text-3xl font-semibold">{t("favorites.title")}</h1>
      {items.length === 0 ? (
        <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
          <span className="flex size-20 items-center justify-center rounded-[1.75rem] bg-sand">
            <Heart className="size-9" aria-hidden />
          </span>
          <p className="mt-6 font-display text-xl font-semibold">{t("favorites.empty")}</p>
          <p className="mt-2 max-w-sm text-stone">{t("favorites.emptyHint")}</p>
          <Link href="/w" className={buttonClass("primary", "lg", "mt-8")}>
            {t("cart.toCatalog")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
