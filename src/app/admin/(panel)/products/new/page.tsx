import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { emptyVariant, ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Новый товар" };

export default async function NewProductPage() {
  const brands = await db.brand.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageHeader title="Новый товар" back={{ href: "/admin/products", label: "Товары" }} />
      <ProductForm
        brands={brands}
        initial={{
          name: "",
          slug: "",
          brandId: brands[0]?.id ?? "",
          gender: "MEN",
          price: "",
          salePrice: "",
          descriptionRu: "",
          descriptionUz: "",
          isNew: true,
          isFeatured: false,
          isPublished: true,
          variants: [emptyVariant()],
        }}
      />
    </>
  );
}
