"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Tags, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/brands", label: "Бренды", icon: Tags },
  { href: "/admin/banners", label: "Баннеры", icon: ImageIcon },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminShell({ newOrders, children }: { newOrders: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon className="size-[18px]" aria-hidden />
            {item.label}
            {item.href === "/admin/orders" && newOrders > 0 && (
              <span className="ml-auto rounded-lg bg-flame px-1.5 py-0.5 text-[11px] font-bold text-white">{newOrders}</span>
            )}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalLink className="size-[18px]" aria-hidden />
          Открыть сайт
        </a>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-[18px]" aria-hidden />
            Выйти
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-svh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-white lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo className="text-white" />
        </div>
        {nav}
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Logo />
        <button type="button" onClick={() => setOpen(true)} className="flex size-10 items-center justify-center rounded-2xl hover:bg-sand" aria-label="Меню">
          <Menu className="size-5" aria-hidden />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-label="Закрыть" />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink text-white">
            <div className="flex h-14 items-center justify-between px-5">
              <Logo className="text-white" />
              <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-2xl hover:bg-white/10" aria-label="Закрыть">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
