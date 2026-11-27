import { create } from "zustand";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  returnLocation: string;
  serviceCharges: number;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";
  status: TripStatus;
  driverId?: string;
  driverInfo?: Driver;
  statusHistory: { status: TripStatus; timestamp: string }[];
  createdAt: string;
  updatedAt?: string;
};

type TripStore = {
  trips: Trip[];
  drivers: Driver[];
  isLoading: boolean;

  // Fetch Data
  fetchTrips: () => Promise<void>;
  fetchDrivers: () => Promise<void>;

  // Trip Management
  addTrip: (trip: Omit<Trip, "id" | "createdAt" | "statusHistory" | "transactionId" | "refundStatus">) => Promise<Trip | null>;
  updateTripStatus: (id: string, status: TripStatus) => Promise<void>;
  assignDriver: (tripId: string, driverId: string) => Promise<void>;
  cancelTrip: (id: string) => Promise<void>;
  getTripById: (id: string) => Trip | undefined;

  // Driver Management
  addDriver: (driver: Omit<Driver, "id">) => Promise<void>;
  updateDriver: (id: string, updates: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  toggleDriverAvailability: (id: string) => Promise<void>;
};

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  drivers: [],
  isLoading: false,

  // ================= FETCH =================
  fetchTrips: async () => {
    try {
      const response = await axios.get(`${API_URL}/trips`);
      const formattedTrips = response.data.map((t: any) => {
        let driverInfo: Driver | undefined = undefined;
        let driverId = t.driver?._id || t.driver;

        if (t.driver && typeof t.driver === "object") {
          driverInfo = {
            id: t.driver._id,
            name: t.driver.name,
            phone: t.driver.phone,
            vehicleNumber: t.driver.vehicleNumber,
            vehicleType: t.driver.vehicleType,
            rating: t.driver.rating,
            isAvailable: t.driver.isAvailable,
          };
        }

        return {
          ...t,
          id: t._id,
          driverId,
          driverInfo,
          transactionId: t.transactionId || `TXN-TRP-${t._id.slice(-6)}`,
          refundStatus: t.paymentStatus === "refunded" ? "processed" : "none",
        };
      });
      set({ trips: formattedTrips });
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  },

  fetchDrivers: async () => {
    try {
      const response = await axios.get(`${API_URL}/trips/drivers`);
      const formattedDrivers = response.data.map((d: any) => ({
        ...d,
        id: d._id,
      }));
      set({ drivers: formattedDrivers });
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  },

  // ================= TRIP MANAGEMENT =================
  addTrip: async (tripData) => {
    try {
      const response = await axios.post(`${API_URL}/trips`, tripData);
      const newTrip = {
        ...response.data,
        id: response.data._id,
        transactionId: `TXN-TRP-${response.data._id.slice(-6)}`,
        refundStatus: "none",
        statusHistory: [{ status: "requested", timestamp: new Date().toISOString() }],
      };
      set({ trips: [newTrip, ...get().trips] });
      return newTrip;
    } catch (error) {
      console.error("Error adding trip:", error);
      return null;
    }
  },

  updateTripStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/trips/${id}/status`, { status });
      const updatedTrip = { ...response.data, id: response.data._id };
      set({
        trips: get().trips.map((t) => (t.id === id ? { ...t, ...updatedTrip } : t)),
      });
    } catch (error) {
      console.error("Error updating trip status:", error);
    }
  },

  assignDriver: async (tripId, driverId) => {
    try {
      const response = await axios.put(`${API_URL}/trips/${tripId}/assign`, { driverId });
      const t = response.data;
      
      let driverInfo: Driver | undefined;
      const driver = get().drivers.find((d) => d.id === driverId);
      if (driver) {
        driverInfo = driver;
      } else if (t.driverInfo) {
        driverInfo = {
          id: driverId,
          name: t.driverInfo.name,
          phone: t.driverInfo.phone,
          vehicleNumber: t.driverInfo.vehicleNumber,
          vehicleType: "N/A",
          rating: 4.5,
          isAvailable: true,
        };
      }

      const updatedTrip = {
        ...t,
        id: t._id,
        driverId,
        driverInfo,
      };

      set({
        trips: get().trips.map((trip) => (trip.id === tripId ? updatedTrip : trip)),
      });
    } catch (error) {
      console.error("Error assigning driver:", error);
    }
  },

  cancelTrip: async (id) => {
    await get().updateTripStatus(id, "cancelled");
  },

  getTripById: (id) => get().trips.find((t) => t.id === id),

  // ================= DRIVER MANAGEMENT =================
  addDriver: async (driverData) => {
    try {
      const response = await axios.post(`${API_URL}/trips/drivers`, driverData);
      const newDriver = { ...response.data, id: response.data._id };
      set({ drivers: [...get().drivers, newDriver] });
    } catch (error) {
      console.error("Error adding driver:", error);
    }
  },

  updateDriver: async (id, updates) => {
    try {
      // Backend me update route nahi hai, isliye local state update kar rahe hain (ya tum backend me route add kar sakte ho)
      set({
        drivers: get().drivers.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      });
    } catch (error) {
      console.error("Error updating driver:", error);
    }
  },

  deleteDriver: async (id) => {
    try {
      // Backend me delete route nahi hai abhi, local state update
      set({ drivers: get().drivers.filter((d) => d.id !== id) });
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  },

  toggleDriverAvailability: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/trips/drivers/${id}/toggle`);
      const updatedDriver = { ...response.data, id: response.data._id };
      set({
        drivers: get().drivers.map((d) => (d.id === id ? updatedDriver : d)),
      });
    } catch (error) {
      console.error("Error toggling driver availability:", error);
    }
  },
}));