import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BrandForm } from "@/components/admin/BrandForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Бренд" };

export default async function EditBrandPage({ params }: PageProps<"/admin/brands/[id]">) {
  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) notFound();
  return (
    <>
      <PageHeader title={brand.name} back={{ href: "/admin/brands", label: "Бренды" }} />
      <BrandForm key={brand.id} brand={brand} />
    </>
  );
}
