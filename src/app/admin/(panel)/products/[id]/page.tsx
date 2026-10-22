import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { buttonClass } from "@/lib/ui";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Товар" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, brands] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { brand: { select: { name: true } }, variants: { orderBy: { sortOrder: "asc" }, include: { sizes: true } } },
    }),
    db.brand.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={`${product.brand.name} ${product.name}`}
        back={{ href: "/admin/products", label: "Товары" }}
        actions={
          product.isPublished && (
            <Link href={`/t/${product.slug}`} target="_blank" className={buttonClass("outline", "md")}>
              <ExternalLink className="size-4" />
              На сайте
            </Link>
          )
        }
      />
      <ProductForm
        key={product.id}
        brands={brands}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brandId: product.brandId,
          gender: product.gender,
          price: String(product.price),
          salePrice: product.salePrice ? String(product.salePrice) : "",
          descriptionRu: product.descriptionRu,
          descriptionUz: product.descriptionUz,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isPublished: product.isPublished,
          variants: product.variants.map((v) => ({
            key: v.id,
            id: v.id,
            sku: v.sku,
            colorNameRu: v.colorNameRu,
            colorNameUz: v.colorNameUz,
            colorFamily: v.colorFamily,
            colorHex: v.colorHex,
            images: v.images,
            sizes: Object.fromEntries(v.sizes.map((s) => [s.size, s.stock])),
          })),
        }}
      />
    </>
  );
}
