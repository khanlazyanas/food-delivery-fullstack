import { create } from "zustand";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ================= TYPES =================
export type Table = {
  id: string;
  number: string;
  capacity: number;
  section: "Indoor" | "Outdoor" | "Private" | "Rooftop";
  isActive: boolean;
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show";

export type Booking = {
  id: string;
  tableId: string;
  tableNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    specialRequests?: string;
  };
  date: string;
  time: string;
  guests: number;
  estimatedBill: number;
  advancePaid: number;
  advancePercent: number;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
};

type BookingStore = {
  tables: Table[];
  bookings: Booking[];
  isLoading: boolean;

  // Fetch
  fetchTables: () => Promise<void>;
  fetchBookings: () => Promise<void>;

  // Table management (Admin)
  addTable: (table: Omit<Table, "id">) => Promise<void>;

  // Booking management
  addBooking: (booking: any) => Promise<Booking | null>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<void>;
  updateBookingDateTime: (id: string, date: string, time: string) => void; // Frontend only for now
  getBookingById: (id: string) => Booking | undefined;
  
  // Availability
  isTableAvailable: (tableId: string, date: string, time: string) => boolean;
  getAvailableTables: (date: string, time: string, guests: number) => Table[];
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  tables: [],
  bookings: [],
  isLoading: false,

  // 👇 Backend se Tables fetch karo
  fetchTables: async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/tables`);
      const formattedTables = response.data.map((t: any) => ({
        ...t,
        id: t._id, // MongoDB ID ko frontend id me map kiya
      }));
      set({ tables: formattedTables });
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  },

  // 👇 Backend se Bookings fetch karo
  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/bookings`);
      // Backend data ko frontend format me map kar rahe hain
      const formattedBookings = response.data.map((b: any) => ({
        ...b,
        id: b._id,
        tableId: b.table?._id || b.table,
        tableNumber: b.table?.number || "N/A", // Agar populate nahi hua toh N/A
        advancePercent: 50, // Dummy value, backend me add karni hogi
        transactionId: b.transactionId || `TXN-BK-${b._id.slice(-6)}`,
        refundStatus: b.paymentStatus === "refunded" ? "processed" : "none",
      }));
      set({ bookings: formattedBookings, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      set({ isLoading: false });
    }
  },

  // Table Add (Admin)
  addTable: async (table) => {
    try {
      const response = await axios.post(`${API_URL}/bookings/tables`, table);
      const newTable = { ...response.data, id: response.data._id };
      set({ tables: [...get().tables, newTable] });
    } catch (error) {
      console.error("Failed to add table:", error);
    }
  },

  // 👇 Naya Booking Create karo
  addBooking: async (bookingData) => {
    try {
      const response = await axios.post(`${API_URL}/bookings`, bookingData);
      const b = response.data;
      
      const newBooking: Booking = {
        ...b,
        id: b._id,
        tableId: b.table,
        tableNumber: bookingData.tableNumber || "N/A",
        advancePercent: bookingData.advancePercent,
      };

      set({ bookings: [newBooking, ...get().bookings] });
      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      return null;
    }
  },

  // 👇 Status Update karo
  updateBookingStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/bookings/${id}/status`, { status });
      const updated = response.data;
      
      set({
        bookings: get().bookings.map((b) =>
          b.id === id ? { ...b, status: updated.status } : b
        ),
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  },

  cancelBooking: async (id, reason) => {
    await get().updateBookingStatus(id, "cancelled");
  },

  // 👇 Reschedule (Backend me route nahi hai abhi, isliye local state update)
  updateBookingDateTime: (id, date, time) => {
    set({
      bookings: get().bookings.map((b) =>
        b.id === id ? { ...b, date, time, updatedAt: new Date().toISOString() } : b
      ),
    });
  },

  getBookingById: (id) => get().bookings.find((b) => b.id === id),

  // ============ AVAILABILITY ============
  isTableAvailable: (tableId, date, time) => {
    const { bookings } = get();
    const conflict = bookings.find(
      (b) =>
        b.tableId === tableId &&
        b.date === date &&
        b.time === time &&
        (b.status === "confirmed" || b.status === "pending")
    );
    return !conflict;
  },

   getAvailableTables: (date, time, guests) => {
    const tables = get().tables;
    return tables.filter(
      (t: Table) => // 👈 Yahan 'Table' type define kar diya hai
        t.isActive &&
        t.capacity >= guests &&
        get().isTableAvailable(t.id, date, time)
    );
  },
}));