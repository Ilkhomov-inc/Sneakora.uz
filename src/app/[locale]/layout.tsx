import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl, SITE } from "@/lib/site";
import { SiteHeader } from "@/components/shop/header/SiteHeader";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { manrope, unbounded } from "../fonts";

// Pages read the database on every request (no build-time prerendering, see next.config.ts).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("title"), template: `%s — ${SITE.name}` },
    description: t("description"),
    openGraph: { siteName: SITE.name, locale: locale === "uz" ? "uz_UZ" : "ru_RU", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="flex min-h-svh flex-col">
        <NextIntlClientProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
