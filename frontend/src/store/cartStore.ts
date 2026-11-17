import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/lib/menuData";

export type CartItem = {
  cartId: string; // unique per variant/addon combination
  id: number;
  name: string;
  image: string;
  basePrice: number;
  finalPrice: number; // basePrice + selected variant + addOns
  quantity: number;
  selectedVariant?: string;
  selectedAddOns: string[];
  instructions?: string; // 👈 NAYA
};

type AddItemPayload = {
  item: MenuItem;
  quantity: number;
  selectedVariant?: string;
  selectedAddOns: string[];
  finalPrice: number;
  instructions?: string; // 👈 NAYA
};

type CartStore = {
  items: CartItem[];
  addItem: (payload: AddItemPayload) => void;
  removeItem: (cartId: string) => void;
  increaseQty: (cartId: string) => void;
  decreaseQty: (cartId: string) => void;
  clearCart: () => void;
  updateInstructions: (cartId: string, instructions: string) => void; // 👈 NAYA
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({
        item,
        quantity,
        selectedVariant,
        selectedAddOns,
        finalPrice,
        instructions,
      }) => {
        // Unique cartId based on variant + sorted addons
        const cartId = `${item.id}-${selectedVariant || "default"}-${[
          ...selectedAddOns,
        ]
          .sort()
          .join("|")}`;

        const existing = get().items.find((i) => i.cartId === cartId);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cartId === cartId
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    // Keep existing instructions or update if new provided
                    instructions: instructions || i.instructions,
                  }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                cartId,
                id: item.id,
                name: item.name,
                image: item.image,
                basePrice: item.price,
                finalPrice,
                quantity,
                selectedVariant,
                selectedAddOns,
                instructions: instructions || undefined,
              },
            ],
          });
        }
      },

      removeItem: (cartId) => {
        set({ items: get().items.filter((i) => i.cartId !== cartId) });
      },

      increaseQty: (cartId) => {
        set({
          items: get().items.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      },

      decreaseQty: (cartId) => {
        const item = get().items.find((i) => i.cartId === cartId);
        if (!item) return;
        if (item.quantity === 1) {
          set({ items: get().items.filter((i) => i.cartId !== cartId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      updateInstructions: (cartId, instructions) => {
        set({
          items: get().items.map((i) =>
            i.cartId === cartId
              ? { ...i, instructions: instructions.trim() || undefined }
              : i
          ),
        });
      },

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.finalPrice * item.quantity,
          0
        ),
    }),
    {
      name: "foodiehub-cart",
      version: 2, // 👈 NAYA: bump karo taaki purana cart auto-clear ho
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
  // Purane cart items me instructions nahi the — reset
  if (version !== 2) {
    return { items: [] } as unknown as CartStore;
  }
  return persistedState as CartStore;
},
    }
  )
);