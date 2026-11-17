import { create } from "zustand";
import { persist } from "zustand/middleware";
import { menuItems as initialItems, MenuItem } from "@/lib/menuData";

const STORE_VERSION = 3; 

type MenuStore = {
  items: MenuItem[];
  addItem: (item: Omit<MenuItem, "id">) => void;
  updateItem: (id: number, updates: Partial<MenuItem>) => void;
  deleteItem: (id: number) => void;
  toggleAvailability: (id: number) => void;
  toggleBestseller: (id: number) => void;
  resetToDefault: () => void;
  syncWithDefaults: () => void;
};

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      items: initialItems,

      addItem: (item) => {
        const newItem: MenuItem = {
          ...item,
          id: Date.now(),
          isAvailable: item.isAvailable ?? true,
        };
        set({ items: [newItem, ...get().items] });
      },

      updateItem: (id, updates) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        });
      },

      deleteItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      toggleAvailability: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
          ),
        });
      },

      toggleBestseller: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, isBestseller: !i.isBestseller } : i
          ),
        });
      },

      resetToDefault: () => set({ items: initialItems }),

      // Smart merge: keep user-edited items but add new defaults
      syncWithDefaults: () => {
        const currentItems = get().items;
        const currentIds = new Set(currentItems.map((i) => i.id));

        // Find new default items (which don't exist in current items)
        const newDefaults = initialItems.filter(
          (item) => !currentIds.has(item.id)
        );

        // Update existing items with new data fields (variants, addOns, etc.)
        const updatedCurrent = currentItems.map((current) => {
          const defaultItem = initialItems.find((d) => d.id === current.id);
          if (defaultItem) {
            // Merge: keep user changes to availability/bestseller, but update other data
            return {
              ...defaultItem,
              isAvailable: current.isAvailable,
              isBestseller: current.isBestseller,
              // User can also edit name, price, etc. — we keep default for safety
            };
          }
          return current;
        });

        set({ items: [...newDefaults, ...updatedCurrent] });
      },
    }),
    {
      name: "foodiehub-menu",
      version: STORE_VERSION,
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        // When version changes, reset to fresh defaults
        if (version !== STORE_VERSION) {
          return { items: initialItems } as MenuStore;
        }
        return persistedState as MenuStore;
      },
    }
  )
);