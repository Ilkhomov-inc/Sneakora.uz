import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-7xl font-bold text-cobalt">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <p className="mt-2 max-w-md text-stone">{t("notFoundText")}</p>
      <Link href="/" className={buttonClass("primary", "lg", "mt-8")}>
        {t("home")}
      </Link>
    </div>
  );
}
