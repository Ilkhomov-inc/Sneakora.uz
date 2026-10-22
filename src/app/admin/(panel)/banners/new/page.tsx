import { BannerForm } from "@/components/admin/BannerForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Новый баннер" };

export default function NewBannerPage() {
  return (
    <>
      <PageHeader title="Новый баннер" back={{ href: "/admin/banners", label: "Баннеры" }} />
      <BannerForm
        banner={{
          placement: "HERO",
          mediaUrl: "",
          mediaUrlMobile: null,
          posterUrl: null,
          posterUrlMobile: null,
          eyebrowRu: null,
          eyebrowUz: null,
          titleRu: null,
          titleUz: null,
          textRu: null,
          textUz: null,
          ctaLabelRu: null,
          ctaLabelUz: null,
          ctaHref: null,
          sortOrder: 10,
          isActive: true,
        }}
      />
    </>
  );
}
