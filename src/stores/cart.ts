"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Cart lives in the browser (no customer accounts yet). Prices here are only for display:
// the server re-reads prices and stock when the cart page opens and when the order is placed.
export type CartItem = {
  key: string; // `${variantId}:${size}`
  productId: string;
  variantId: string;
  slug: string;
  sku: string;
  name: string;
  brandName: string;
  colorNameRu: string;
  colorNameUz: string;
  image: string | null;
  size: string;
  price: number;
  quantity: number;
};

export const MAX_QUANTITY = 10;

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  syncPrices: (prices: Record<string, number>) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const key = `${item.variantId}:${item.size}`;
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, ...item, quantity: Math.min(MAX_QUANTITY, i.quantity + quantity) } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, key, quantity }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) } : i)),
        })),
      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      syncPrices: (prices) =>
        set((state) => ({
          items: state.items.map((i) => (prices[i.key] !== undefined && prices[i.key] > 0 ? { ...i, price: prices[i.key] } : i)),
        })),
    }),
    { name: "sneakora-cart", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
