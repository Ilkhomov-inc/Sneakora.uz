"use client";

import { create } from "zustand";
import type { CartItem } from "./cart";

// Transient UI state shared between distant components (header ↔ product page).
type UiState = {
  addedItem: CartItem | null;
  showAdded: (item: CartItem) => void;
  hideAdded: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

export const useUi = create<UiState>()((set) => ({
  addedItem: null,
  showAdded: (item) => set({ addedItem: item }),
  hideAdded: () => set({ addedItem: null }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
