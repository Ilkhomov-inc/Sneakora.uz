import { getTranslations } from "next-intl/server";
import { MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getNavBrands } from "@/lib/catalog";
import { getSettings, telegramChatUrl } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { InstagramIcon } from "./InstagramIcon";
import { TelegramIcon } from "./TelegramIcon";

export async function SiteFooter() {
  const [t, brands, settings] = await Promise.all([getTranslations(), getNavBrands(), getSettings()]);
  const telegram = telegramChatUrl(settings.telegramUsername);
  const instagram = settings.instagram.trim().replace(/^@/, "");

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="shell pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">{SITE.wordmark}</p>
            <p className="mt-4 max-w-sm text-white/70">{t("footer.tagline")}</p>
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sand"
              >
                <TelegramIcon className="size-5 text-cobalt" />
                {t("footer.writeTelegram")}
              </a>
            )}
          </div>

          <FooterColumn title={t("footer.shop")}>
            <FooterLink href="/w?new=1">{t("nav.new")}</FooterLink>
            {brands.map((b) => (
              <FooterLink key={b.slug} href={`/brand/${b.slug}`}>
                {b.name}
              </FooterLink>
            ))}
            <FooterLink href="/w?sale=1">{t("nav.sale")}</FooterLink>
            <FooterLink href="/w">{t("footer.allSneakers")}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t("footer.help")}>
            <li className="text-sm font-semibold text-white">{t("footer.howToOrder")}</li>
            <li className="text-sm text-white/60">{t("footer.howToOrderText")}</li>
            <FooterLink href="/cart">{t("nav.cart")}</FooterLink>
            <FooterLink href="/favorites">{t("nav.favorites")}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t("footer.contacts")}>
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                  <Phone className="size-4" aria-hidden />
                  {settings.phone}
                </a>
              </li>
            )}
            {telegram && (
              <li>
                <a href={telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                  <TelegramIcon className="size-4" />@{settings.telegramUsername.replace(/^@/, "")}
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                  <InstagramIcon className="size-4" />@{instagram}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="inline-flex items-center gap-2 text-sm text-white/70">
                <MapPin className="size-4" aria-hidden />
                {settings.address}
              </li>
            )}
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p>{SITE.domain}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/50">{title}</h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/70 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
