"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { useMounted } from "@/hooks/useMounted";
import { formatPrice, tr } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import type { Locale } from "@/lib/types";
import { cartCount, cartTotal, MAX_QUANTITY, useCart, type CartItem } from "@/stores/cart";
import { CheckoutForm } from "./CheckoutForm";

export type LineStatus = { key: string; price: number; stock: number; problem: "unavailable" | "out_of_stock" | "not_enough" | null };

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const syncPrices = useCart((s) => s.syncPrices);
  const [statuses, setStatuses] = useState<Record<string, LineStatus>>({});

  const applyStatuses = (lines: LineStatus[]) => {
    setStatuses(Object.fromEntries(lines.map((l) => [l.key, l])));
    syncPrices(Object.fromEntries(lines.filter((l) => !l.problem).map((l) => [l.key, l.price])));
  };

  // Re-check prices and stock on the server whenever the cart content changes.
  const signature = items.map((i) => `${i.key}x${i.quantity}`).join("|");
  useEffect(() => {
    if (!mounted || !items.length) return;
    const controller = new AbortController();
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, size: i.size, quantity: i.quantity })) }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { lines: LineStatus[] } | null) => {
        if (!data) return;
        applyStatuses(data.lines);
      })
      .catch(() => {});
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `signature` captures the relevant cart changes
  }, [mounted, signature]);

  if (!mounted) {
    return <div className="shell min-h-[50vh] py-10" aria-busy="true" />;
  }

  if (!items.length) {
    return (
      <div className="shell flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-20 items-center justify-center rounded-[1.75rem] bg-sand">
          <ShoppingBag className="size-9" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-2xl font-semibold">{t("empty")}</h1>
        <p className="mt-2 max-w-sm text-stone">{t("emptyHint")}</p>
        <Link href="/w" className={buttonClass("primary", "lg", "mt-8")}>
          {t("toCatalog")}
        </Link>
      </div>
    );
  }

  const hasProblems = items.some((i) => statuses[i.key]?.problem);
  const count = cartCount(items);
  const total = cartTotal(items.filter((i) => !statuses[i.key]?.problem));

  return (
    <div className="shell grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 lg:py-12">
      <section>
        <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-stone">{t("items", { count })}</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <CartLine key={item.key} item={item} status={statuses[item.key]} locale={locale} />
          ))}
        </ul>
      </section>

      <aside id="checkout" className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] bg-sand p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold">{t("summary")}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone">{t("items", { count })}</dt>
              <dd className="font-semibold">{formatPrice(total, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">{t("delivery")}</dt>
              <dd className="font-semibold">{t("deliveryValue")}</dd>
            </div>
            <div className="flex justify-between border-t border-sand-deep pt-4 text-lg">
              <dt className="font-bold">{t("total")}</dt>
              <dd className="font-bold">{formatPrice(total, locale)}</dd>
            </div>
          </dl>
          {hasProblems ? (
            <p className="mt-6 rounded-2xl bg-white p-4 text-sm font-semibold text-danger">{t("fixCart")}</p>
          ) : (
            <CheckoutForm onStockProblem={applyStatuses} />
          )}
        </div>
        <p className="mt-4 px-2 text-sm text-stone">{t("telegramNote")}</p>
      </aside>
    </div>
  );
}

function CartLine({ item, status, locale }: { item: CartItem; status?: LineStatus; locale: Locale }) {
  const t = useTranslations("cart");
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const problem = status?.problem;

  return (
    <li className="flex gap-4 py-5">
      <Link href={`/t/${item.slug}?color=${encodeURIComponent(item.sku)}`} className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-sand md:size-36">
        {item.image && <SmartImage src={item.image} alt={`${item.brandName} ${item.name}`} fill sizes="144px" className="object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone">{item.brandName}</p>
            <Link href={`/t/${item.slug}?color=${encodeURIComponent(item.sku)}`} className="font-semibold hover:underline">
              {item.name}
            </Link>
            <p className="mt-0.5 text-sm text-stone">
              {tr(locale, item.colorNameRu, item.colorNameUz)} · {t("size")} EU {item.size}
            </p>
          </div>
          <p className={clsx("shrink-0 font-bold", problem && "text-stone line-through")}>{formatPrice(item.price * item.quantity, locale)}</p>
        </div>

        {problem && (
          <p className="mt-2 text-sm font-semibold text-danger">
            {problem === "unavailable" ? t("unavailable") : problem === "out_of_stock" ? t("outOfStock") : t("notEnough", { count: status.stock })}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-2xl border border-line">
            <button
              type="button"
              onClick={() => setQuantity(item.key, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex size-10 items-center justify-center rounded-l-2xl hover:bg-sand disabled:opacity-40"
              aria-label={t("decrease")}
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="w-8 text-center text-sm font-semibold" aria-label={t("quantity")}>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.key, item.quantity + 1)}
              disabled={item.quantity >= Math.min(MAX_QUANTITY, status?.stock || MAX_QUANTITY)}
              className="flex size-10 items-center justify-center rounded-r-2xl hover:bg-sand disabled:opacity-40"
              aria-label={t("increase")}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(item.key)}
            className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-stone hover:bg-sand hover:text-ink"
          >
            <Trash2 className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t("remove")}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
