import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/lib/ui";
import { TelegramIcon } from "../TelegramIcon";

export async function HelpBlock({ telegramUrl }: { telegramUrl: string | null }) {
  if (!telegramUrl) return null;
  const t = await getTranslations("home");
  return (
    <section className="shell">
      <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-cobalt p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">{t("helpTitle")}</h2>
          <p className="mt-3 text-white/85">{t("helpText")}</p>
        </div>
        <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("light", "lg", "shrink-0")}>
          <TelegramIcon className="size-5 text-cobalt" />
          {t("helpCta")}
        </a>
      </div>
    </section>
  );
}
