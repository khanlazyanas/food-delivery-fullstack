import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RestaurantSettings = {
  // Restaurant Info
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  openingTime: string;
  closingTime: string;

  // Delivery
  deliveryRangeKm: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  minOrderValue: number;
  serviceablePincodes: string[];

  // Tax
  taxPercent: number;

  // Payment
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;

  // Table Booking (PRD 6)
  tableBookingEnabled: boolean;
  advancePaymentPercent: number; // 50 = 50%
  cancellationHoursBefore: number; // free cancellation hours
  rescheduleAllowed: boolean;
  maxGuestsPerBooking: number;
  bookingTimeSlots: string[];

  // Notifications
  orderNotifications: boolean;
  offerNotifications: boolean;
};

const defaultSettings: RestaurantSettings = {
  name: "FoodieHub",
  tagline: "Good food, no waiting",
  phone: "+91 98765 43210",
  email: "hello@foodiehub.com",
  address: "123 Food Street, Flavor Town",
  city: "Mumbai",
  openingTime: "10:00",
  closingTime: "23:00",

  deliveryRangeKm: 15,
  deliveryFee: 40,
  freeDeliveryAbove: 500,
  minOrderValue: 199,
  serviceablePincodes: ["400", "411", "110", "560", "500"],

  taxPercent: 5,

  codEnabled: true,
  onlinePaymentEnabled: true,

  // Table Booking defaults
  tableBookingEnabled: true,
  advancePaymentPercent: 50,
  cancellationHoursBefore: 4,
  rescheduleAllowed: true,
  maxGuestsPerBooking: 10,
  bookingTimeSlots: [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ],

  orderNotifications: true,
  offerNotifications: true,
};

type SettingsStore = {
  settings: RestaurantSettings;
  updateSettings: (updates: Partial<RestaurantSettings>) => void;
  addPincode: (pincode: string) => void;
  removePincode: (pincode: string) => void;
  addTimeSlot: (slot: string) => void;
  removeTimeSlot: (slot: string) => void;
  resetToDefault: () => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) =>
        set({
          settings: { ...get().settings, ...updates },
        }),

      addPincode: (pincode) => {
        const current = get().settings.serviceablePincodes;
        const cleaned = pincode.trim();
        if (!cleaned || current.includes(cleaned)) return;
        set({
          settings: {
            ...get().settings,
            serviceablePincodes: [...current, cleaned],
          },
        });
      },

      removePincode: (pincode) => {
        set({
          settings: {
            ...get().settings,
            serviceablePincodes: get().settings.serviceablePincodes.filter(
              (p) => p !== pincode
            ),
          },
        });
      },

      addTimeSlot: (slot) => {
        const current = get().settings.bookingTimeSlots;
        const cleaned = slot.trim();
        if (!cleaned || current.includes(cleaned)) return;
        const updated = [...current, cleaned].sort();
        set({
          settings: { ...get().settings, bookingTimeSlots: updated },
        });
      },

      removeTimeSlot: (slot) => {
        set({
          settings: {
            ...get().settings,
            bookingTimeSlots: get().settings.bookingTimeSlots.filter(
              (s) => s !== slot
            ),
          },
        });
      },

      resetToDefault: () => set({ settings: defaultSettings }),
    }),
    {
      name: "foodiehub-settings",
      version: 3, // 👈 bump (naye booking fields)
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        if (version !== 3) {
          return { settings: defaultSettings } as unknown as SettingsStore;
        }
        return persistedState as SettingsStore;
      },
    }
  )
);