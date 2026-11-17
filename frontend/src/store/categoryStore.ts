import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialCategories, Category } from "@/lib/menuData";

type CategoryStore = {
  categories: Category[];
  addCategory: (name: string, subcategories: string[]) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryActive: (id: string) => void;
  reorderCategories: (newCategories: Category[]) => void;
  resetToDefault: () => void;
};

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: initialCategories,

      addCategory: (name, subcategories) => {
        const newCategory: Category = {
          id: "cat_" + Date.now(),
          name,
          subcategories,
          isActive: true,
          order: get().categories.length + 1,
        };
        set({ categories: [...get().categories, newCategory] });
      },

      updateCategory: (id, updates) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      deleteCategory: (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });
      },

      toggleCategoryActive: (id) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        });
      },

      reorderCategories: (newCategories) => {
        set({ categories: newCategories });
      },

      resetToDefault: () => set({ categories: initialCategories }),
    }),
    {
      name: "foodiehub-categories",
      version: 1,
      skipHydration: true,
    }
  )
);