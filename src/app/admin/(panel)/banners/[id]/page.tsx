import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BannerForm } from "@/components/admin/BannerForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Баннер" };

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  const { id } = await params;
  const banner = await db.banner.findUnique({ where: { id } });
  if (!banner) notFound();
  return (
    <>
      <PageHeader title={banner.titleRu || "Баннер"} back={{ href: "/admin/banners", label: "Баннеры" }} />
      <BannerForm key={banner.id} banner={banner} />
    </>
  );
}
