"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { ChevronDown, Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { useMounted } from "@/hooks/useMounted";
import { cartCount, useCart } from "@/stores/cart";
import { useFavorites } from "@/stores/favorites";
import { useUi } from "@/stores/ui";
import type { NavBrand } from "@/lib/types";
import { MegaPanel } from "./MegaPanel";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { AddedToCart } from "./AddedToCart";

export function HeaderBar({ brands }: { brands: NavBrand[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const mounted = useMounted();
  const count = useCart((s) => cartCount(s.items));
  const favorites = useFavorites((s) => s.items.length);
  const setSearchOpen = useUi((s) => s.setSearchOpen);
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close menus on navigation.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpenBrand(null);
    setMobileOpen(false);
  }
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const open = (slug: string) => {
    clearTimeout(closeTimer.current);
    setOpenBrand(slug);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenBrand(null), 120);
  };

  const activeBrand = brands.find((b) => b.slug === openBrand) ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        {t("skipToContent")}
      </a>
      <div
        className="shell relative flex h-16 items-center gap-4"
        onMouseLeave={scheduleClose}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpenBrand(null);
        }}
      >
        <Link href="/" className="shrink-0" aria-label="Sneakora">
          <Logo />
        </Link>

        <nav className="hidden flex-1 justify-center lg:flex" aria-label={t("brands")}>
          <ul className="flex items-center gap-1">
            <li>
              <NavLink href="/w?new=1" onMouseEnter={() => setOpenBrand(null)}>
                {t("new")}
              </NavLink>
            </li>
            {brands.map((brand) => (
              <li key={brand.slug} onMouseEnter={() => open(brand.slug)} onFocus={() => open(brand.slug)}>
                <NavLink href={`/brand/${brand.slug}`} active={openBrand === brand.slug} aria-expanded={openBrand === brand.slug}>
                  {brand.name}
                  <ChevronDown className={clsx("size-3.5 transition-transform", openBrand === brand.slug && "rotate-180")} aria-hidden />
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink href="/w?sale=1" className="text-flame" onMouseEnter={() => setOpenBrand(null)}>
                {t("sale")}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 items-center gap-2 rounded-2xl px-2.5 text-stone transition-colors hover:bg-sand hover:text-ink xl:w-56 xl:bg-sand xl:px-3.5"
            aria-label={t("search")}
          >
            <Search className="size-5 shrink-0" aria-hidden />
            <span className="hidden truncate text-sm xl:inline">{t("searchPlaceholder")}</span>
          </button>
          <IconLink href="/favorites" label={t("favorites")} badge={mounted ? favorites : 0}>
            <Heart className="size-5" aria-hidden />
          </IconLink>
          <IconLink href="/cart" label={t("cart")} badge={mounted ? count : 0}>
            <ShoppingBag className="size-5" aria-hidden />
          </IconLink>
          <LocaleSwitcher className="ml-1 hidden md:flex" />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-2xl hover:bg-sand lg:hidden"
            aria-label={t("menu")}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>

        {activeBrand && (
          <MegaPanel brand={activeBrand} onMouseEnter={() => open(activeBrand.slug)} onMouseLeave={scheduleClose} />
        )}
      </div>

      <MobileMenu brands={brands} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay brands={brands} />
      <AddedToCart />
    </header>
  );
}

function NavLink({
  href,
  active,
  className,
  children,
  ...rest
}: React.ComponentProps<typeof Link> & { active?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex h-10 items-center gap-1 rounded-2xl px-3.5 text-[15px] font-semibold transition-colors hover:bg-sand",
        active && "bg-sand",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

function IconLink({ href, label, badge, children }: { href: string; label: string; badge: number; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative flex size-10 items-center justify-center rounded-2xl transition-colors hover:bg-sand" aria-label={label}>
      {children}
      {badge > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cobalt px-1 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
