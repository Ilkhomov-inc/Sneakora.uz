// Colour groups used by the catalog filter. Each variant stores one `colorFamily` key.
export const COLOR_FAMILIES = [
  { key: "black", hex: "#121212", ru: "Чёрный", uz: "Qora" },
  { key: "white", hex: "#F7F6F2", ru: "Белый", uz: "Oq" },
  { key: "grey", hex: "#9AA0A6", ru: "Серый", uz: "Kulrang" },
  { key: "beige", hex: "#D9C7A7", ru: "Бежевый", uz: "Bej" },
  { key: "brown", hex: "#7A4E2D", ru: "Коричневый", uz: "Jigarrang" },
  { key: "red", hex: "#C8302C", ru: "Красный", uz: "Qizil" },
  { key: "pink", hex: "#EE8FB0", ru: "Розовый", uz: "Pushti" },
  { key: "orange", hex: "#F07A21", ru: "Оранжевый", uz: "To‘q sariq" },
  { key: "yellow", hex: "#F2C230", ru: "Жёлтый", uz: "Sariq" },
  { key: "green", hex: "#3E8E4F", ru: "Зелёный", uz: "Yashil" },
  { key: "blue", hex: "#2B4BFF", ru: "Синий", uz: "Ko‘k" },
  { key: "purple", hex: "#7C4DBC", ru: "Фиолетовый", uz: "Binafsha" },
  { key: "multi", hex: "conic-gradient(#C8302C, #F2C230, #3E8E4F, #2B4BFF, #7C4DBC, #C8302C)", ru: "Разноцветный", uz: "Rang-barang" },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]["key"];

export const COLOR_KEYS = COLOR_FAMILIES.map((c) => c.key) as string[];

export function colorFamily(key: string) {
  return COLOR_FAMILIES.find((c) => c.key === key);
}
