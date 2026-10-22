"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductCardData } from "@/lib/types";

// Saved in the browser. Once customer accounts exist, sync this list to the server on sign-in.
type FavoritesState = {
  items: ProductCardData[];
  toggle: (product: ProductCardData) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) =>
          state.items.some((p) => p.id === product.id)
            ? { items: state.items.filter((p) => p.id !== product.id) }
            : { items: [product, ...state.items].slice(0, 100) },
        ),
      has: (id) => get().items.some((p) => p.id === id),
      remove: (id) => set((state) => ({ items: state.items.filter((p) => p.id !== id) })),
    }),
    { name: "sneakora-favorites", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
