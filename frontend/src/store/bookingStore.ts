import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  estimatedBill: number;
  advancePaid: number;
  advancePercent: number;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  
  // 👇 NAYA: PRD Section 24 Payment Management
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";

  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
};

// ================= DEFAULT TABLES =================
const defaultTables: Table[] = [
  { id: "T1", number: "T-01", capacity: 2, section: "Indoor", isActive: true },
  { id: "T2", number: "T-02", capacity: 2, section: "Indoor", isActive: true },
  { id: "T3", number: "T-03", capacity: 4, section: "Indoor", isActive: true },
  { id: "T4", number: "T-04", capacity: 4, section: "Indoor", isActive: true },
  { id: "T5", number: "T-05", capacity: 6, section: "Indoor", isActive: true },
  { id: "T6", number: "T-06", capacity: 4, section: "Outdoor", isActive: true },
  { id: "T7", number: "T-07", capacity: 6, section: "Outdoor", isActive: true },
  { id: "T8", number: "T-08", capacity: 8, section: "Private", isActive: true },
  { id: "T9", number: "T-09", capacity: 10, section: "Private", isActive: true },
  { id: "T10", number: "T-10", capacity: 4, section: "Rooftop", isActive: true },
];

// ================= STORE =================
type BookingStore = {
  tables: Table[];
  bookings: Booking[];

  // Table management
  addTable: (table: Omit<Table, "id">) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  toggleTableActive: (id: string) => void;

  // Booking management
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "refundStatus">) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string, reason?: string) => void;
  getBookingById: (id: string) => Booking | undefined;
  
  // 👇 NAYA: Payment Management
  updateTransactionId: (id: string, transactionId: string) => void;
  updateRefundStatus: (id: string, status: "none" | "requested" | "processed") => void;

  // Availability
  isTableAvailable: (
    tableId: string,
    date: string,
    time: string
  ) => boolean;
  getAvailableTables: (date: string, time: string, guests: number) => Table[];

  resetToDefault: () => void;
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      tables: defaultTables,
      bookings: [],

      // ============ TABLE MANAGEMENT ============
      addTable: (table) => {
        const newTable: Table = {
          ...table,
          id: "T" + Date.now().toString().slice(-6),
        };
        set({ tables: [...get().tables, newTable] });
      },

      updateTable: (id, updates) => {
        set({
          tables: get().tables.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },

      deleteTable: (id) => {
        set({ tables: get().tables.filter((t) => t.id !== id) });
      },

      toggleTableActive: (id) => {
        set({
          tables: get().tables.map((t) =>
            t.id === id ? { ...t, isActive: !t.isActive } : t
          ),
        });
      },

      // ============ BOOKING MANAGEMENT ============
      addBooking: (booking) => {
        const newBooking: Booking = {
          ...booking,
          id: "BK" + Date.now().toString().slice(-8),
          createdAt: new Date().toISOString(),
          refundStatus: "none", // Default refund status
          transactionId: booking.transactionId || `TXN-BK-${Date.now().toString().slice(-6)}`, // Auto-generate Txn ID for demo
        };
        set({ bookings: [newBooking, ...get().bookings] });
        return newBooking;
      },

      updateBookingStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? { ...b, status, updatedAt: new Date().toISOString() }
              : b
          ),
        });
      },

      cancelBooking: (id, reason) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "cancelled" as BookingStatus,
                  cancelledAt: new Date().toISOString(),
                  cancellationReason: reason,
                  updatedAt: new Date().toISOString(),
                  paymentStatus:
                    b.paymentStatus === "paid"
                      ? ("refunded" as const)
                      : b.paymentStatus,
                  refundStatus: b.paymentStatus === "paid" ? "requested" : "none",
                }
              : b
          ),
        });
      },

      getBookingById: (id) => get().bookings.find((b) => b.id === id),

      // 👇 NAYA: Payment functions
      updateTransactionId: (id, transactionId) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, transactionId } : b
          ),
        });
      },

      updateRefundStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, refundStatus: status } : b
          ),
        });
      },

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
        const { tables, isTableAvailable } = get();
        return tables.filter(
          (t) =>
            t.isActive &&
            t.capacity >= guests &&
            isTableAvailable(t.id, date, time)
        );
      },

      resetToDefault: () => set({ tables: defaultTables, bookings: [] }),
    }),
    {
      name: "foodiehub-bookings",
      version: 2, // 👈 Bumped for new fields
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<BookingStore>;
        
        // Version 1 -> 2: Add new payment fields
        if (version < 2 && state?.bookings) {
          state.bookings = state.bookings.map((b) => ({
            ...b,
            transactionId: b.transactionId || `TXN-BK-${b.id.slice(-6)}`,
            refundStatus: b.paymentStatus === "refunded" ? "processed" : "none",
          }));
        }
        
        return state as BookingStore;
      },
    }
  )
);