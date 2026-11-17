import { create } from "zustand";
import { persist } from "zustand/middleware";
import { offers as initialOffers, Offer } from "@/lib/offersData";

export type ExtendedOffer = Offer & {
  isActive: boolean;
};

const STORE_VERSION = 2; // 👈 bumped from 1 → 2 (new fields: startDate, applicableItems)

type OfferStore = {
  offers: ExtendedOffer[];
  addOffer: (offer: Omit<ExtendedOffer, "id">) => void;
  updateOffer: (id: number, updates: Partial<ExtendedOffer>) => void;
  deleteOffer: (id: number) => void;
  toggleOfferActive: (id: number) => void;
  resetToDefault: () => void;
};

export const useOfferStore = create<OfferStore>()(
  persist(
    (set, get) => ({
      offers: initialOffers.map((o) => ({
        ...o,
        isActive: o.isActive !== false,
      })),

      addOffer: (offer) => {
        const newOffer: ExtendedOffer = {
          ...offer,
          id: Date.now(),
        };
        set({ offers: [newOffer, ...get().offers] });
      },

      updateOffer: (id, updates) => {
        set({
          offers: get().offers.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        });
      },

      deleteOffer: (id) => {
        set({ offers: get().offers.filter((o) => o.id !== id) });
      },

      toggleOfferActive: (id) => {
        set({
          offers: get().offers.map((o) =>
            o.id === id ? { ...o, isActive: !o.isActive } : o
          ),
        });
      },

      resetToDefault: () =>
        set({
          offers: initialOffers.map((o) => ({
            ...o,
            isActive: o.isActive !== false,
          })),
        }),
    }),
    {
      name: "foodiehub-offers",
      version: STORE_VERSION,
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<OfferStore> | undefined;

        // 🟢 Version 1 → 2 upgrade: add new fields safely to old offers
        if (version < 2 && state?.offers) {
          const migratedOffers = state.offers.map((o) => ({
            ...o,
            startDate: o.startDate || "2026-10-01", // safe default
            applicableItems: o.applicableItems || [],
            isActive: o.isActive !== false,
          }));
          return { ...state, offers: migratedOffers } as unknown as OfferStore;
        }

        // 🟠 Unknown / older version — fallback to defaults
        if (version !== STORE_VERSION || !state?.offers) {
          return {
            offers: initialOffers.map((o) => ({
              ...o,
              isActive: o.isActive !== false,
            })),
          } as unknown as OfferStore;
        }

        return state as OfferStore;
      },
    }
  )
);