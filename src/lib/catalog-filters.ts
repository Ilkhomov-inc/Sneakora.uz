import { COLOR_KEYS } from "./colors";

// Catalog filters live in the URL: /w?brand=nike,puma&gender=men&size=42,43&color=black&price=0-1000000&sale=1&sort=price-asc
export const GENDER_PARAMS = ["men", "women", "kids"] as const;
export type GenderParam = (typeof GENDER_PARAMS)[number];

export const SORT_KEYS = ["featured", "newest", "price-asc", "price-desc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const PRICE_RANGES = [
  { key: "0-1000000", min: 0, max: 1_000_000 },
  { key: "1000000-1500000", min: 1_000_000, max: 1_500_000 },
  { key: "1500000-2000000", min: 1_500_000, max: 2_000_000 },
  { key: "2000000-", min: 2_000_000, max: null },
] as const;

export const PAGE_SIZE = 24;

export type CatalogFilters = {
  brands: string[];
  genders: GenderParam[];
  sizes: string[];
  colors: string[];
  prices: string[];
  sale: boolean;
  isNew: boolean;
  q: string;
  sort: SortKey;
  page: number;
};

type ParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function toSearchParams(input: ParamsInput): URLSearchParams {
  if (input instanceof URLSearchParams) return input;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else if (value !== undefined) params.set(key, value);
  }
  return params;
}

function list(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseFilters(input: ParamsInput): CatalogFilters {
  const params = toSearchParams(input);
  const sort = params.get("sort") as SortKey | null;
  const page = Number(params.get("page"));
  return {
    brands: list(params, "brand").map((b) => b.toLowerCase()),
    genders: list(params, "gender").filter((g): g is GenderParam => (GENDER_PARAMS as readonly string[]).includes(g)),
    sizes: list(params, "size").filter((s) => /^\d{1,2}(\.5)?$/.test(s)),
    colors: list(params, "color").filter((c) => COLOR_KEYS.includes(c)),
    prices: list(params, "price").filter((p) => PRICE_RANGES.some((r) => r.key === p)),
    sale: params.get("sale") === "1",
    isNew: params.get("new") === "1",
    q: (params.get("q") ?? "").trim().slice(0, 80),
    sort: sort && (SORT_KEYS as readonly string[]).includes(sort) ? sort : "featured",
    page: Number.isInteger(page) && page > 1 ? Math.min(page, 50) : 1,
  };
}

export function filtersToSearchParams(filters: Partial<CatalogFilters>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.brands?.length) params.set("brand", filters.brands.join(","));
  if (filters.genders?.length) params.set("gender", filters.genders.join(","));
  if (filters.sizes?.length) params.set("size", filters.sizes.join(","));
  if (filters.colors?.length) params.set("color", filters.colors.join(","));
  if (filters.prices?.length) params.set("price", filters.prices.join(","));
  if (filters.sale) params.set("sale", "1");
  if (filters.isNew) params.set("new", "1");
  if (filters.sort && filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function activeFilterCount(filters: CatalogFilters, lockedBrand?: boolean): number {
  return (
    (lockedBrand ? 0 : filters.brands.length) +
    filters.genders.length +
    filters.sizes.length +
    filters.colors.length +
    filters.prices.length +
    (filters.sale ? 1 : 0) +
    (filters.isNew ? 1 : 0)
  );
}
