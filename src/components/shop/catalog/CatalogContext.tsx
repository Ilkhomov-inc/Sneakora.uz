"use client";

import { createContext, use, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { filtersToSearchParams, type CatalogFilters } from "@/lib/catalog-filters";

type CatalogContextValue = {
  filters: CatalogFilters;
  update: (patch: Partial<CatalogFilters>) => void;
  reset: () => void;
  pending: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function useCatalog() {
  const ctx = use(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}

/** Filters are the URL: every change navigates, the server renders the new result list. */
export function CatalogProvider({
  filters,
  basePath,
  children,
}: {
  filters: CatalogFilters;
  basePath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = (next: Partial<CatalogFilters>) => {
    const query = filtersToSearchParams(next).toString();
    startTransition(() => router.push(query ? `${basePath}?${query}` : basePath, { scroll: false }));
  };

  const value: CatalogContextValue = {
    filters,
    pending,
    sidebarOpen,
    setSidebarOpen,
    drawerOpen,
    setDrawerOpen,
    update: (patch) => navigate({ ...filters, ...patch, page: 1 }),
    reset: () => navigate({ q: filters.q, sort: filters.sort }),
  };

  return <CatalogContext value={value}>{children}</CatalogContext>;
}
