import "server-only";
import { cache } from "react";
import { db } from "./db";

// Site-wide settings editable in /admin/settings. Stored as key/value rows; missing keys use DEFAULTS.
export const SETTING_FIELDS = [
  { key: "telegramUsername", label: "Telegram для заказов (username без @)", multiline: false },
  { key: "phone", label: "Телефон", multiline: false },
  { key: "instagram", label: "Instagram (username без @)", multiline: false },
  { key: "address", label: "Адрес / город", multiline: false },
  { key: "promoRu", label: "Промо-полоса над шапкой, RU (каждая строка — отдельное сообщение)", multiline: true },
  { key: "promoUz", label: "Промо-полоса над шапкой, UZ", multiline: true },
  { key: "deliveryRu", label: "Текст «Доставка и оплата» на странице товара, RU", multiline: true },
  { key: "deliveryUz", label: "Текст «Доставка и оплата» на странице товара, UZ", multiline: true },
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"];
export type Settings = Record<SettingKey, string>;

export const SETTING_DEFAULTS: Settings = {
  telegramUsername: "",
  phone: "",
  instagram: "",
  address: "Ташкент",
  promoRu: "Заказ через Telegram — без регистрации\nПодскажем размер и наличие в Telegram",
  promoUz: "Telegram orqali buyurtma — ro‘yxatdan o‘tmasdan\nO‘lcham va mavjudlik haqida Telegram’da aytib beramiz",
  deliveryRu:
    "После оформления заказа напишите нам в Telegram — менеджер подтвердит наличие, стоимость и сроки доставки. Оплата при получении или переводом по договорённости.",
  deliveryUz:
    "Buyurtma bergandan so‘ng bizga Telegram’da yozing — menejer mavjudlik, narx va yetkazib berish muddatini tasdiqlaydi. To‘lov qabul qilishda yoki kelishuv bo‘yicha o‘tkazma orqali.",
};

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const settings = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in settings) settings[row.key as SettingKey] = row.value;
  }
  return settings;
});

export function telegramChatUrl(username: string, text?: string): string | null {
  const clean = username.trim().replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
  if (!clean) return null;
  return `https://t.me/${clean}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
