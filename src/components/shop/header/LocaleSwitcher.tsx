"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    if (next === locale) return;
    const query = Object.fromEntries(searchParams.entries());
    startTransition(() => router.replace({ pathname, query }, { locale: next }));
  };

  return (
    <div className={clsx("flex items-center rounded-2xl bg-sand p-0.5 text-xs font-bold", pending && "opacity-60", className)}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={clsx("rounded-[14px] px-2.5 py-1.5 uppercase transition-colors", l === locale ? "bg-white shadow-sm" : "text-stone hover:text-ink")}
          aria-pressed={l === locale}
          lang={l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
