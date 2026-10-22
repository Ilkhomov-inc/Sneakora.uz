// Labels used across the admin panel (Russian only).
export const ORDER_STATUS_LABEL = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  SHIPPED: "Отправлен",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
} as const;

export const ORDER_STATUS_TONE = {
  NEW: "orange",
  CONFIRMED: "blue",
  SHIPPED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
} as const;

export const GENDER_LABEL = {
  MEN: "Мужские",
  WOMEN: "Женские",
  KIDS: "Детские",
  UNISEX: "Унисекс",
} as const;

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tashkent",
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function sum(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} сум`;
}
