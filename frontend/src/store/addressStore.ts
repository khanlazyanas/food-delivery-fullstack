import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

type AddressStore = {
  addresses: Address[];
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
};

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (address) => {
        const newAddress: Address = {
          ...address,
          id: "ADDR" + Date.now().toString().slice(-6),
        };
        // If this is first address or marked default, unset others
        let updated = [...get().addresses];
        if (newAddress.isDefault || updated.length === 0) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
          newAddress.isDefault = true;
        }
        set({ addresses: [...updated, newAddress] });
      },

      updateAddress: (id, address) => {
        set({
          addresses: get().addresses.map((a) =>
            a.id === id ? { ...a, ...address } : a
          ),
        });
      },

      removeAddress: (id) => {
        set({ addresses: get().addresses.filter((a) => a.id !== id) });
      },

      setDefault: (id) => {
        set({
          addresses: get().addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        });
      },
    }),
    {
      name: "foodiehub-addresses",
      skipHydration: true,
    }
  )
);