import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  role?: string; // 👈 NAYA
  createdAt?: string;
  updatedAt?: string;
};

type AuthStore = {
  user: User | null;
  token: string | null; // 👈 NAYA
  isLoggedIn: boolean;
  isLoading: boolean; // 👈 NAYA
  login: (name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: Partial<User>) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,

      // 👇 Backend API se Login/Signup
      login: async (name, phone) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            name,
            phone,
          });

          const { _id, name: resName, phone: resPhone, role, token } = response.data;

          set({
            user: {
              id: _id,
              name: resName,
              phone: resPhone,
              role: role,
              updatedAt: new Date().toISOString(),
            },
            token,
            isLoggedIn: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          console.error("Login failed:", error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => set({ user: null, token: null, isLoggedIn: false }),

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
      version: 3, // 👈 Version bump kiya backend integration ke liye
      skipHydration: true,
      migrate: (persistedState: unknown) => {
        return persistedState as AuthStore;
      },
    }
  )
);