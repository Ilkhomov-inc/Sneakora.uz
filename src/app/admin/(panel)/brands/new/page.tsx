import { db } from "@/lib/db";
import { BrandForm } from "@/components/admin/BrandForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Новый бренд" };

export default async function NewBrandPage() {
  const last = await db.brand.aggregate({ _max: { sortOrder: true } });
  return (
    <>
      <PageHeader title="Новый бренд" back={{ href: "/admin/brands", label: "Бренды" }} />
      <BrandForm
        brand={{
          name: "",
          slug: "",
          logoUrl: null,
          bannerUrl: null,
          bannerPosterUrl: null,
          cardMedia: [],
          cardPosterUrl: null,
          titleRu: null,
          titleUz: null,
          textRu: null,
          textUz: null,
          sortOrder: (last._max.sortOrder ?? 0) + 1,
          isActive: true,
        }}
      />
    </>
  );
}
