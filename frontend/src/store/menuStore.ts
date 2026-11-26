import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { menuItems as initialItems, MenuItem } from "@/lib/menuData";

const STORE_VERSION = 4; // 👈 Version bump kiya hai backend integration ke liye
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type MenuStore = {
  items: MenuItem[];
  isLoading: boolean;
  fetchMenu: () => Promise<void>;
  addItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateItem: (id: number | string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: number | string) => Promise<void>;
  toggleAvailability: (id: number | string) => Promise<void>;
  toggleBestseller: (id: number | string) => Promise<void>;
  resetToDefault: () => void;
  syncWithDefaults: () => void;
};

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      items: initialItems,
      isLoading: false,

      // 👇 1. Backend se Menu Fetch Karna
      fetchMenu: async () => {
        set({ isLoading: true });
        try {
          const response = await axios.get(`${API_URL}/menu`);
          
          if (response.data && response.data.length > 0) {
            // MongoDB se aaye _id ko frontend ke id me map kar rahe hain
            const formattedItems = response.data.map((item: any) => ({
              ...item,
              id: item._id, 
            }));
            set({ items: formattedItems, isLoading: false });
          } else {
            // Agar database khali hai, toh fallback defaults use karo
            set({ items: initialItems, isLoading: false });
          }
        } catch (error) {
          console.error("Failed to fetch menu from backend:", error);
          set({ isLoading: false });
        }
      },

      // 👇 2. Naya Item Add Karna
      addItem: async (item) => {
        try {
          const response = await axios.post(`${API_URL}/menu`, item);
          const newItem = { 
            ...response.data, 
            id: response.data._id 
          };
          set({ items: [newItem, ...get().items] });
        } catch (error) {
          console.error("Error adding item to backend:", error);
        }
      },

      // 👇 3. Item Update Karna
      updateItem: async (id, updates) => {
        try {
          const response = await axios.put(`${API_URL}/menu/${id}`, updates);
          const updatedItem = { 
            ...response.data, 
            id: response.data._id 
          };
          set({
            items: get().items.map((i) => (i.id === id ? updatedItem : i)),
          });
        } catch (error) {
          console.error("Error updating item in backend:", error);
        }
      },

      // 👇 4. Item Delete Karna
      deleteItem: async (id) => {
        try {
          await axios.delete(`${API_URL}/menu/${id}`);
          set({ items: get().items.filter((i) => i.id !== id) });
        } catch (error) {
          console.error("Error deleting item from backend:", error);
        }
      },

      // 👇 5. Availability Toggle Karna (Out of Stock)
      toggleAvailability: async (id) => {
        try {
          const item = get().items.find((i) => i.id === id);
          if (!item) return;

          const response = await axios.put(`${API_URL}/menu/${id}`, {
            isAvailable: !item.isAvailable,
          });
          
          const updatedItem = { 
            ...response.data, 
            id: response.data._id 
          };
          
          set({
            items: get().items.map((i) => (i.id === id ? updatedItem : i)),
          });
        } catch (error) {
          console.error("Error toggling availability:", error);
        }
      },

      // 👇 6. Bestseller Toggle Karna
      toggleBestseller: async (id) => {
        try {
          const item = get().items.find((i) => i.id === id);
          if (!item) return;

          const response = await axios.put(`${API_URL}/menu/${id}`, {
            isBestseller: !item.isBestseller,
          });

          const updatedItem = { 
            ...response.data, 
            id: response.data._id 
          };

          set({
            items: get().items.map((i) => (i.id === id ? updatedItem : i)),
          });
        } catch (error) {
          console.error("Error toggling bestseller:", error);
        }
      },

      // Note: Ye dono functions abhi local state ke liye rakhe gaye hain
      resetToDefault: () => set({ items: initialItems }),

      syncWithDefaults: () => {
        const currentItems = get().items;
        const currentIds = new Set(currentItems.map((i) => i.id));
        const newDefaults = initialItems.filter((item) => !currentIds.has(item.id));

        const updatedCurrent = currentItems.map((current) => {
          const defaultItem = initialItems.find((d) => d.id === current.id);
          if (defaultItem) {
            return {
              ...defaultItem,
              isAvailable: current.isAvailable,
              isBestseller: current.isBestseller,
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
        // Backend connect hone ke baad local storage reset kar denge
        if (version !== STORE_VERSION) {
          return { items: initialItems } as MenuStore;
        }
        return persistedState as MenuStore;
      },
    }
  )
);