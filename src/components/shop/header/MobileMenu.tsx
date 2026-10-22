"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { ChevronDown, Heart, ShoppingBag, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { GENDER_PARAMS } from "@/lib/catalog-filters";
import type { NavBrand } from "@/lib/types";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function MobileMenu({ brands, open, onClose }: { brands: NavBrand[]; open: boolean; onClose: () => void }) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("nav.menu")}>
      <button type="button" className="absolute inset-0 animate-fade-in bg-ink/40" onClick={onClose} aria-label={t("nav.close")} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm animate-slide-in-right flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Logo />
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-2xl hover:bg-sand" aria-label={t("nav.close")}>
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-1 font-display text-xl font-semibold">
            <li>
              <Link href="/w?new=1" className="block rounded-2xl px-3 py-3 hover:bg-sand">
                {t("nav.new")}
              </Link>
            </li>
            {brands.map((brand) => {
              const isOpen = expanded === brand.slug;
              return (
                <li key={brand.slug}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : brand.slug)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left hover:bg-sand"
                    aria-expanded={isOpen}
                  >
                    {brand.name}
                    <ChevronDown className={clsx("size-5 transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                  {isOpen && (
                    <ul className="mb-2 ml-3 animate-fade-in space-y-0.5 border-l border-line pl-3 font-sans text-base font-semibold">
                      {GENDER_PARAMS.map((g) => (
                        <li key={g}>
                          <Link href={`/brand/${brand.slug}?gender=${g}`} className="block rounded-xl px-3 py-2.5 hover:bg-sand">
                            {t(`gender.${g}`)}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={`/brand/${brand.slug}`} className="block rounded-xl px-3 py-2.5 text-stone hover:bg-sand">
                          {t("nav.allModels", { brand: brand.name })}
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
            <li>
              <Link href="/w?sale=1" className="block rounded-2xl px-3 py-3 text-flame hover:bg-sand">
                {t("nav.sale")}
              </Link>
            </li>
          </ul>

          <div className="mt-6 space-y-1 border-t border-line pt-4 text-base font-semibold">
            <Link href="/favorites" className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-sand">
              <Heart className="size-5" aria-hidden /> {t("nav.favorites")}
            </Link>
            <Link href="/cart" className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-sand">
              <ShoppingBag className="size-5" aria-hidden /> {t("nav.cart")}
            </Link>
          </div>
        </nav>

        <div className="flex items-center justify-between border-t border-line px-5 py-4">
          <span className="text-sm text-stone">{t("nav.language")}</span>
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
