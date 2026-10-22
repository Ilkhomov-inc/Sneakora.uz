"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { useMounted } from "@/hooks/useMounted";
import { discountPercent, formatPrice, tr } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import type { Gender, Locale, ProductCardData } from "@/lib/types";
import { useCart } from "@/stores/cart";
import { useFavorites } from "@/stores/favorites";
import { useUi } from "@/stores/ui";
import { TelegramIcon } from "../TelegramIcon";
import { Gallery } from "./Gallery";

export type ProductViewData = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  brandSlug: string;
  gender: Gender;
  price: number;
  salePrice: number | null;
  isNew: boolean;
  description: string;
  variants: {
    id: string;
    sku: string;
    colorNameRu: string;
    colorNameUz: string;
    colorHex: string;
    images: string[];
    sizes: { size: string; stock: number }[];
  }[];
};

const GENDER_PARAM: Record<Gender, string | null> = { MEN: "men", WOMEN: "women", KIDS: "kids", UNISEX: null };

export function ProductView({
  product,
  initialSku,
  deliveryText,
  telegramUrl,
}: {
  product: ProductViewData;
  initialSku?: string;
  deliveryText: string;
  telegramUrl: string | null;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const mounted = useMounted();
  const addToCart = useCart((s) => s.add);
  const showAdded = useUi((s) => s.showAdded);
  const isFavorite = useFavorites((s) => s.items.some((p) => p.id === product.id));
  const toggleFavorite = useFavorites((s) => s.toggle);

  const [variantIndex, setVariantIndex] = useState(() => Math.max(0, product.variants.findIndex((v) => v.sku === initialSku)));
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const variant = product.variants[variantIndex];
  const price = product.salePrice ?? product.price;
  const discount = discountPercent(product.price, product.salePrice);
  const soldOut = !variant?.sizes.some((s) => s.stock > 0);
  const genderParam = GENDER_PARAM[product.gender];

  const selectVariant = (index: number) => {
    setVariantIndex(index);
    setSize(null);
    setSizeError(false);
    const url = new URL(window.location.href);
    url.searchParams.set("color", product.variants[index].sku);
    window.history.replaceState(null, "", url);
  };

  const add = () => {
    if (!variant) return;
    if (!size) {
      setSizeError(true);
      return;
    }
    const item = {
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      sku: variant.sku,
      name: product.name,
      brandName: product.brandName,
      colorNameRu: variant.colorNameRu,
      colorNameUz: variant.colorNameUz,
      image: variant.images[0] ?? null,
      size,
      price,
    };
    addToCart(item);
    showAdded({ ...item, key: `${variant.id}:${size}`, quantity: 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cardData: ProductCardData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brandName,
    gender: product.gender,
    price: product.price,
    salePrice: product.salePrice,
    isNew: product.isNew,
    colors: product.variants.map((v) => ({ sku: v.sku, hex: v.colorHex, image: v.images[0] ?? null, hoverImage: v.images[1] ?? null })),
  };

  return (
    <div className="shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-14">
      <Gallery key={variant?.sku} images={variant?.images ?? []} alt={`${product.brandName} ${product.name}`} />

      <div className="lg:sticky lg:top-24 lg:self-start">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-stone" aria-label="breadcrumbs">
          <Link href={`/brand/${product.brandSlug}`} className="font-semibold text-ink hover:underline">
            {product.brandName}
          </Link>
          <span aria-hidden>/</span>
          {genderParam ? (
            <Link href={`/brand/${product.brandSlug}?gender=${genderParam}`} className="hover:underline">
              {t(`gender.${product.gender}`)}
            </Link>
          ) : (
            <span>{t(`gender.${product.gender}`)}</span>
          )}
          {product.isNew && <span className="rounded-lg bg-cobalt px-2 py-0.5 text-xs font-bold text-white">{t("product.new")}</span>}
        </nav>

        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">{product.name}</h1>

        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl font-bold">
          <span className={clsx(product.salePrice && "text-flame")}>{formatPrice(price, locale)}</span>
          {product.salePrice && (
            <>
              <span className="text-base font-medium text-stone line-through">{formatPrice(product.price, locale)}</span>
              <span className="rounded-lg bg-flame px-2 py-0.5 text-sm text-white">−{discount}%</span>
            </>
          )}
        </p>

        {product.variants.length > 0 && (
          <div className="mt-8">
            <p className="text-sm">
              <span className="font-semibold">{t("product.color")}:</span> {tr(locale, variant.colorNameRu, variant.colorNameUz)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((v, i) => (
                <button
                  key={v.sku}
                  type="button"
                  onClick={() => selectVariant(i)}
                  className={clsx(
                    "relative size-16 overflow-hidden rounded-2xl bg-sand transition",
                    i === variantIndex ? "ring-2 ring-ink ring-offset-2" : "hover:ring-1 hover:ring-line",
                  )}
                  aria-label={tr(locale, v.colorNameRu, v.colorNameUz)}
                  aria-pressed={i === variantIndex}
                >
                  {v.images[0] ? (
                    <SmartImage src={v.images[0]} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-3 rounded-full" style={{ background: v.colorHex }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <p className={clsx("text-sm font-semibold", sizeError && "text-danger")}>{sizeError ? t("product.pickSizeFirst") : t("product.selectSize")}</p>
            <p className="text-xs text-stone">{t("product.sizeGrid")}</p>
          </div>
          <div className={clsx("mt-3 grid grid-cols-4 gap-2 rounded-2xl sm:grid-cols-5", sizeError && "ring-2 ring-danger ring-offset-4")} role="radiogroup" aria-label={t("product.selectSize")}>
            {variant?.sizes.map((s) => {
              const available = s.stock > 0;
              const selected = size === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!available}
                  onClick={() => {
                    setSize(s.size);
                    setSizeError(false);
                  }}
                  className={clsx(
                    "relative h-12 rounded-xl border text-sm font-semibold transition-colors",
                    selected && "border-ink bg-ink text-white",
                    !selected && available && "border-line hover:border-ink",
                    !available && "cursor-not-allowed border-transparent bg-sand text-stone/50 line-through",
                  )}
                  title={!available ? t("product.outOfStock") : s.stock <= 2 ? t("product.lowStock") : undefined}
                >
                  {s.size}
                  {available && s.stock <= 2 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-flame" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button type="button" onClick={add} disabled={soldOut} className={buttonClass("primary", "lg", "w-full")}>
            <ShoppingBag className="size-5" aria-hidden />
            {soldOut ? t("product.soldOut") : t("product.addToCart")}
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(cardData)}
            className={buttonClass("outline", "lg", "w-full")}
            aria-pressed={mounted && isFavorite}
          >
            <Heart className={clsx("size-5", mounted && isFavorite && "fill-flame text-flame")} aria-hidden />
            {mounted && isFavorite ? t("product.inFavorites") : t("product.addFavorite")}
          </button>
        </div>

        <div className="mt-10 divide-y divide-line border-y border-line">
          {product.description && (
            <Accordion title={t("product.description")} defaultOpen>
              <p className="whitespace-pre-line">{product.description}</p>
              {variant && (
                <p className="mt-3 text-sm text-stone">
                  {t("product.sku")}: {variant.sku}
                </p>
              )}
            </Accordion>
          )}
          {deliveryText && (
            <Accordion title={t("product.delivery")}>
              <p className="whitespace-pre-line">{deliveryText}</p>
            </Accordion>
          )}
          <Accordion title={t("product.sizeHelp")}>
            <p>{t("product.sizeHelpText")}</p>
            {telegramUrl && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm", "mt-4")}>
                <TelegramIcon className="size-4 text-cobalt" />
                {t("product.sizeHelpCta")}
              </a>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
        {title}
        <svg className="size-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </summary>
      <div className="mt-3 leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}
