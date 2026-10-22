"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatPrice, tr } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import { useUi } from "@/stores/ui";
import type { Locale } from "@/lib/types";

/** Confirmation that pops up under the header after "Добавить в корзину". */
export function AddedToCart() {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const item = useUi((s) => s.addedItem);
  const hide = useUi((s) => s.hideAdded);

  useEffect(() => {
    if (!item) return;
    const id = setTimeout(hide, 6000);
    return () => clearTimeout(id);
  }, [item, hide]);

  if (!item) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full z-40">
      <div className="shell flex justify-end">
        <div
          className="pointer-events-auto mt-2 w-full max-w-sm animate-slide-up rounded-3xl border border-line bg-white p-4 shadow-[0_24px_48px_-16px_rgba(18,18,18,0.3)]"
          role="status"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="size-5 text-mint" aria-hidden />
              {t("added")}
            </p>
            <button type="button" onClick={hide} className="flex size-8 items-center justify-center rounded-xl hover:bg-sand" aria-label="×">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="flex gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-sand">
              {item.image && <SmartImage src={item.image} alt="" fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone">{item.brandName}</p>
              <p className="truncate font-semibold">{item.name}</p>
              <p className="text-stone">
                {tr(locale, item.colorNameRu, item.colorNameUz)} · EU {item.size}
              </p>
              <p className="mt-1 font-bold">{formatPrice(item.price, locale)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/cart" onClick={hide} className={buttonClass("outline", "md")}>
              {t("goToCart")}
            </Link>
            <Link href="/cart#checkout" onClick={hide} className={buttonClass("primary", "md")}>
              {t("checkout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
