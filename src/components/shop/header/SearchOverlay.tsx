"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useUi } from "@/stores/ui";
import type { NavBrand } from "@/lib/types";

export function SearchOverlay({ brands }: { brands: NavBrand[] }) {
  const t = useTranslations("nav");
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearchOpen);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/w?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t("search")}>
      <button type="button" className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setOpen(false)} aria-label={t("close")} />
      <div className="relative animate-slide-up bg-white shadow-xl">
        <form onSubmit={submit} className="shell flex h-20 items-center gap-3" role="search">
          <Search className="size-6 shrink-0 text-stone" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 min-w-0 flex-1 bg-transparent font-display text-lg font-medium outline-none placeholder:text-stone/60 sm:text-2xl"
            enterKeyHint="search"
            aria-label={t("search")}
          />
          <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-2xl hover:bg-sand" aria-label={t("close")}>
            <X className="size-5" aria-hidden />
          </button>
        </form>
        <div className="shell flex flex-wrap gap-2 pb-6">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={`/brand/${b.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-sand px-4 py-2 text-sm font-semibold transition-colors hover:bg-sand-deep"
            >
              {b.name}
            </Link>
          ))}
          <Link href="/w?new=1" onClick={() => setOpen(false)} className="rounded-2xl bg-sand px-4 py-2 text-sm font-semibold transition-colors hover:bg-sand-deep">
            {t("new")}
          </Link>
        </div>
      </div>
    </div>
  );
}
