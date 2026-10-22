// Shared types that are safe to import from client components
// (they mirror the Prisma enums without pulling the generated client into the bundle).

export type Locale = "ru" | "uz";
export type Gender = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
export type MediaType = "IMAGE" | "VIDEO";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  gender: Gender;
  price: number;
  salePrice: number | null;
  isNew: boolean;
  colors: { sku: string; hex: string; image: string | null; hoverImage: string | null }[];
};

export type NavBrand = {
  slug: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  bannerType: MediaType;
  bannerPosterUrl: string | null;
};
