"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { useMounted } from "@/hooks/useMounted";
import { discountPercent, formatPrice } from "@/lib/format";
import { useFavorites } from "@/stores/favorites";
import type { Locale, ProductCardData } from "@/lib/types";

export function ProductCard({ product, priority, sizes }: { product: ProductCardData; priority?: boolean; sizes?: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const mounted = useMounted();
  const [active, setActive] = useState(0);
  const isFavorite = useFavorites((s) => s.items.some((p) => p.id === product.id));
  const toggleFavorite = useFavorites((s) => s.toggle);

  const color = product.colors[active] ?? product.colors[0];
  const href = active > 0 && color ? `/t/${product.slug}?color=${encodeURIComponent(color.sku)}` : `/t/${product.slug}`;
  const discount = discountPercent(product.price, product.salePrice);
  const title = `${product.brandName} ${product.name}`;

  return (
    <article className="group relative">
      <Link href={href} className="block" aria-label={title}>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand">
          {color?.image && (
            <SmartImage
              src={color.image}
              alt={title}
              fill
              priority={priority}
              sizes={sizes ?? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"}
              className={clsx("object-cover transition duration-500", color.hoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]")}
            />
          )}
          {color?.hoverImage && (
            <SmartImage
              src={color.hoverImage}
              alt=""
              fill
              sizes={sizes ?? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"}
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.isNew && <span className="rounded-xl bg-cobalt px-2.5 py-1 text-[11px] font-bold text-white">{t("product.new")}</span>}
            {discount && <span className="rounded-xl bg-flame px-2.5 py-1 text-[11px] font-bold text-white">−{discount}%</span>}
          </div>
        </div>

        <div className="mt-3 px-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone">
            {product.brandName} · {t(`gender.${product.gender}`)}
          </p>
          <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{product.name}</h3>
          <p className="mt-0.5 text-sm text-stone">{t("product.colors", { count: product.colors.length })}</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2 font-bold">
            <span className={clsx(product.salePrice && "text-flame")}>{formatPrice(product.salePrice ?? product.price, locale)}</span>
            {product.salePrice && <span className="text-sm font-medium text-stone line-through">{formatPrice(product.price, locale)}</span>}
          </p>
        </div>
      </Link>

      {product.colors.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5 px-1">
          {product.colors.slice(0, 6).map((c, i) => (
            <button
              key={c.sku}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={clsx(
                "size-5 rounded-full border-2 transition-transform hover:scale-110",
                i === active ? "border-ink" : "border-white ring-1 ring-line",
              )}
              style={{ background: c.hex }}
              aria-label={`${t("product.color")} ${i + 1}`}
              aria-pressed={i === active}
            />
          ))}
          {product.colors.length > 6 && <span className="text-xs leading-5 text-stone">+{product.colors.length - 6}</span>}
        </div>
      )}

      <button
        type="button"
        onClick={() => toggleFavorite(product)}
        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-2xl bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
        aria-label={mounted && isFavorite ? t("favorites.remove") : t("product.addFavorite")}
        aria-pressed={mounted && isFavorite}
      >
        <Heart className={clsx("size-[18px]", mounted && isFavorite && "fill-flame text-flame")} aria-hidden />
      </button>
    </article>
  );
}
