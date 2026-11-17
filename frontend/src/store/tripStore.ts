import { create } from "zustand";
import { persist } from "zustand/middleware";

// ================= TYPES =================
export type TripStatus =
  | "requested"
  | "driver-assigned"
  | "driver-en-route"
  | "picked-up"
  | "restaurant-reached"
  | "return-trip"
  | "completed"
  | "cancelled";

export type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  rating: number;
  isAvailable: boolean;
};

export type Trip = {
  id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    specialRequests?: string;
  };
  pickupLocation: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:mm
  passengers: number;
  returnLocation: string;
  serviceCharges: number;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  
  // 👇 NAYA: PRD Section 24 Payment Management
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";

  status: TripStatus;
  driverId?: string;
  driverInfo?: Driver;
  statusHistory: { status: TripStatus; timestamp: string }[];
  createdAt: string;
  updatedAt?: string;
};

// ================= DEFAULT DRIVERS =================
const defaultDrivers: Driver[] = [
  {
    id: "DRV001",
    name: "Rahul Sharma",
    phone: "9876543210",
    vehicleNumber: "MH 01 AB 1234",
    vehicleType: "Sedan",
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: "DRV002",
    name: "Amit Kumar",
    phone: "9876543211",
    vehicleNumber: "MH 01 CD 5678",
    vehicleType: "SUV",
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: "DRV003",
    name: "Suresh Patil",
    phone: "9876543212",
    vehicleNumber: "MH 01 EF 9012",
    vehicleType: "Sedan",
    rating: 4.7,
    isAvailable: true,
  },
];

// ================= STORE =================
type TripStore = {
  trips: Trip[];
  drivers: Driver[];

  // Trip management
  addTrip: (trip: Omit<Trip, "id" | "createdAt" | "statusHistory" | "transactionId" | "refundStatus">) => Trip;
  updateTripStatus: (id: string, status: TripStatus) => void;
  assignDriver: (tripId: string, driverId: string) => void;
  cancelTrip: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
  
  // 👇 NAYA: Payment Management
  updateTransactionId: (id: string, transactionId: string) => void;
  updateRefundStatus: (id: string, status: "none" | "requested" | "processed") => void;

  // Driver management
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  toggleDriverAvailability: (id: string) => void;

  resetToDefault: () => void;
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],
      drivers: defaultDrivers,

      // ============ TRIP MANAGEMENT ============
      addTrip: (trip) => {
        const newTrip: Trip = {
          ...trip,
          id: "TRP" + Date.now().toString().slice(-8),
          createdAt: new Date().toISOString(),
          transactionId: `TXN-TRP-${Date.now().toString().slice(-6)}`,
          refundStatus: "none",
          statusHistory: [
            { status: "requested", timestamp: new Date().toISOString() },
          ],
        };
        set({ trips: [newTrip, ...get().trips] });
        return newTrip;
      },

      updateTripStatus: (id, status) => {
        const now = new Date().toISOString();
        set({
          trips: get().trips.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: now,
                  statusHistory: [
                    ...t.statusHistory,
                    { status, timestamp: now },
                  ],
                }
              : t
          ),
        });
      },

      assignDriver: (tripId, driverId) => {
        const driver = get().drivers.find((d) => d.id === driverId);
        if (!driver) return;
        const now = new Date().toISOString();
        set({
          trips: get().trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  driverId,
                  driverInfo: driver,
                  status: "driver-assigned" as TripStatus,
                  updatedAt: now,
                  statusHistory: [
                    ...t.statusHistory,
                    { status: "driver-assigned" as TripStatus, timestamp: now },
                  ],
                }
              : t
          ),
        });
      },

      cancelTrip: (id) => {
        const now = new Date().toISOString();
        set({
          trips: get().trips.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "cancelled" as TripStatus,
                  paymentStatus:
                    t.paymentStatus === "paid"
                      ? ("refunded" as const)
                      : t.paymentStatus,
                  refundStatus: t.paymentStatus === "paid" ? "requested" : "none",
                  updatedAt: now,
                  statusHistory: [
                    ...t.statusHistory,
                    { status: "cancelled" as TripStatus, timestamp: now },
                  ],
                }
              : t
          ),
        });
      },

      getTripById: (id) => get().trips.find((t) => t.id === id),

      // 👇 NAYA: Payment functions
      updateTransactionId: (id, transactionId) => {
        set({
          trips: get().trips.map((t) =>
            t.id === id ? { ...t, transactionId } : t
          ),
        });
      },

      updateRefundStatus: (id, status) => {
        set({
          trips: get().trips.map((t) =>
            t.id === id ? { ...t, refundStatus: status } : t
          ),
        });
      },

      // ============ DRIVER MANAGEMENT ============
      addDriver: (driver) => {
        const newDriver: Driver = {
          ...driver,
          id: "DRV" + Date.now().toString().slice(-6),
        };
        set({ drivers: [...get().drivers, newDriver] });
      },

      updateDriver: (id, updates) => {
        set({
          drivers: get().drivers.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        });
      },

      deleteDriver: (id) => {
        set({ drivers: get().drivers.filter((d) => d.id !== id) });
      },

      toggleDriverAvailability: (id) => {
        set({
          drivers: get().drivers.map((d) =>
            d.id === id ? { ...d, isAvailable: !d.isAvailable } : d
          ),
        });
      },

      resetToDefault: () => set({ trips: [], drivers: defaultDrivers }),
    }),
    {
      name: "foodiehub-trips",
      version: 2, // 👈 Bumped for new fields
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<TripStore>;
        
        // Version 1 -> 2: Add new payment fields
        if (version < 2 && state?.trips) {
          state.trips = state.trips.map((t) => ({
            ...t,
            transactionId: t.transactionId || `TXN-TRP-${t.id.slice(-6)}`,
            refundStatus: t.paymentStatus === "refunded" ? "processed" : "none",
          }));
        }
        
        return state as TripStore;
      },
    }
  )
);