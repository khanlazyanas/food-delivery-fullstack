import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  createdAt: string;
  updatedAt?: string;
};

type AuthStore = {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: {
    name?: string;
    email?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
  }) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      login: (user) =>
        set({
          user: {
            ...user,
            updatedAt: new Date().toISOString(),
          },
          isLoggedIn: true,
        }),

      logout: () => set({ user: null, isLoggedIn: false }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({
          user: {
            ...currentUser,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({
          user: {
            ...currentUser,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: "foodiehub-auth",
      version: 2,
      skipHydration: true,
      migrate: (persistedState: unknown) => {
        // Future migrations if needed
        return persistedState as AuthStore;
      },
    }
  )
);