import type { Locale } from "./types";

const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** 1740000 → «1 740 000 сум» / «1 740 000 so‘m» */
export function formatPrice(value: number, locale: Locale): string {
  return `${numberFormat.format(value)} ${locale === "uz" ? "so‘m" : "сум"}`;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** Picks the field for the current language, falling back to the other one. */
export function tr(locale: Locale, ru: string | null | undefined, uz: string | null | undefined): string {
  return (locale === "uz" ? uz || ru : ru || uz) ?? "";
}

export function discountPercent(price: number, salePrice: number | null): number | null {
  if (!salePrice || salePrice >= price) return null;
  return Math.round((1 - salePrice / price) * 100);
}

/** Digits only, e.g. "+998 (90) 123-45-67" → "998901234567". */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function formatOrderNumber(number: number): string {
  return `№${number}`;
}
