import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { OrderActions } from "@/components/shop/order/OrderActions";
import { buildOrderMessage, getOrderByToken } from "@/lib/orders";
import { getSettings, telegramChatUrl } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OrderPage({ params }: PageProps<"/[locale]/order/[token]">) {
  const { token, locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const order = await getOrderByToken(token);
  if (!order) notFound();

  const [t, settings] = await Promise.all([getTranslations("order"), getSettings()]);
  const message = buildOrderMessage(order, locale, SITE.domain);
  const telegramUrl = telegramChatUrl(settings.telegramUsername, message);

  return (
    <div className="shell max-w-3xl py-10 md:py-16">
      <div className="rounded-[2rem] bg-sand p-6 md:p-10">
        <CheckCircle2 className="size-12 text-mint" aria-hidden />
        <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">{t("title", { number: order.number })}</h1>
        <p className="mt-3 max-w-xl text-ink-soft">{telegramUrl ? t("lead") : t("noTelegram", { phone: order.phone })}</p>
        <OrderActions telegramUrl={telegramUrl} message={message} />
        {settings.phone && <p className="mt-5 text-sm text-stone">{t("callUs", { phone: settings.phone })}</p>}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">{t("items")}</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-sand">
                {item.image && <SmartImage src={item.image} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone">{item.brandName}</p>
                <p className="font-semibold">{item.name}</p>
                <p className="text-stone">
                  {item.colorName} · EU {item.size} · × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 font-bold">{formatPrice(item.price * item.quantity, locale)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-lg font-bold">
          <span>{t("total")}</span>
          <span>{formatPrice(order.total, locale)}</span>
        </p>
      </section>

      <Link href="/" className={buttonClass("outline", "lg", "mt-10")}>
        {t("backToShop")}
      </Link>
    </div>
  );
}
