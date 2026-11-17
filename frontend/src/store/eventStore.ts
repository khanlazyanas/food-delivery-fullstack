import { create } from "zustand";
import { persist } from "zustand/middleware";

// ================= TYPES =================
export type Event = {
  id: string;
  name: string;
  banner: string;
  artist: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  description: string;
  rules: string;
  ticketPrice: number;
  totalChairs: number; // default 50
  isActive: boolean;
  createdAt: string;
};

export type BookedChair = {
  chairNumber: number; // 1-50
  customerName: string;
  customerPhone: string;
};

export type Ticket = {
  id: string; // unique ticket ID
  eventId: string;
  eventName: string;
  eventBanner: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventArtist: string;
  chairNumbers: number[];
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  ticketPrice: number;
  totalPrice: number;
  advancePaid: number;
  advancePercent: number;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  
  // 👇 NAYA: PRD Section 24 Payment Management
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";

  status: "confirmed" | "cancelled" | "checked-in";
  createdAt: string;
  checkedInAt?: string;
};

// ================= DEFAULT EVENTS =================
const defaultEvents: Event[] = [
  {
    id: "EVT001",
    name: "Live Sufi Night",
    banner:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
    artist: "Ustad Rahat Ali Khan",
    date: "2026-11-15",
    time: "20:00",
    venue: "FoodieHub Rooftop Arena",
    description:
      "An enchanting evening of Sufi music with the legendary Ustad Rahat Ali Khan. Experience soulful melodies under the stars with delicious food and drinks.",
    rules:
      "• Gates open 30 minutes before show\n• No outside food or drinks\n• Valid ID required for entry\n• Late entry allowed up to 30 min after start\n• Photography allowed (no flash)",
    ticketPrice: 999,
    totalChairs: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "EVT002",
    name: "Bollywood Retro Night",
    banner:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200",
    artist: "DJ Aqeel",
    date: "2026-11-22",
    time: "21:00",
    venue: "FoodieHub Main Hall",
    description:
      "Dance to the iconic Bollywood retro beats with DJ Aqeel. A night full of nostalgia, energy, and unforgettable music.",
    rules:
      "• Age 18+ only\n• Dress code: Smart casual\n• No re-entry after exit\n• Drink responsibly",
    ticketPrice: 799,
    totalChairs: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// ================= STORE =================
type EventStore = {
  events: Event[];
  tickets: Ticket[];

  // Event management
  addEvent: (event: Omit<Event, "id" | "createdAt">) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  toggleEventActive: (id: string) => void;

  // Ticket management
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "transactionId" | "refundStatus">) => Ticket;
  cancelTicket: (id: string) => void;
  checkInTicket: (id: string) => void;
  getTicketById: (id: string) => Ticket | undefined;
  
  // 👇 NAYA: Payment Management
  updateTransactionId: (id: string, transactionId: string) => void;
  updateRefundStatus: (id: string, status: "none" | "requested" | "processed") => void;

  // Availability
  getBookedChairs: (eventId: string) => number[];
  isChairAvailable: (eventId: string, chairNumber: number) => boolean;
  getAvailableChairs: (eventId: string) => number[];

  resetToDefault: () => void;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: defaultEvents,
      tickets: [],

      // ============ EVENT MANAGEMENT ============
      addEvent: (event) => {
        const newEvent: Event = {
          ...event,
          id: "EVT" + Date.now().toString().slice(-6),
          createdAt: new Date().toISOString(),
        };
        set({ events: [newEvent, ...get().events] });
      },

      updateEvent: (id, updates) => {
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        });
      },

      deleteEvent: (id) => {
        set({ events: get().events.filter((e) => e.id !== id) });
      },

      toggleEventActive: (id) => {
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, isActive: !e.isActive } : e
          ),
        });
      },

      // ============ TICKET MANAGEMENT ============
      addTicket: (ticket) => {
        const newTicket: Ticket = {
          ...ticket,
          id: "TKT" + Date.now().toString().slice(-8),
          createdAt: new Date().toISOString(),
          transactionId: `TXN-TKT-${Date.now().toString().slice(-6)}`,
          refundStatus: "none",
        };
        set({ tickets: [newTicket, ...get().tickets] });
        return newTicket;
      },

      cancelTicket: (id) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "cancelled" as const,
                  paymentStatus:
                    t.paymentStatus === "paid"
                      ? ("refunded" as const)
                      : t.paymentStatus,
                  refundStatus: t.paymentStatus === "paid" ? "requested" : "none", // 👈 NAYA
                }
              : t
          ),
        });
      },

      checkInTicket: (id) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "checked-in" as const,
                  checkedInAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      getTicketById: (id) => get().tickets.find((t) => t.id === id),

      // 👇 NAYA: Payment functions
      updateTransactionId: (id, transactionId) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id ? { ...t, transactionId } : t
          ),
        });
      },

      updateRefundStatus: (id, status) => {
        set({
          tickets: get().tickets.map((t) =>
            t.id === id ? { ...t, refundStatus: status } : t
          ),
        });
      },

      // ============ AVAILABILITY ============
      getBookedChairs: (eventId) => {
        const { tickets } = get();
        const booked: number[] = [];
        tickets.forEach((t) => {
          if (
            t.eventId === eventId &&
            (t.status === "confirmed" || t.status === "checked-in")
          ) {
            booked.push(...t.chairNumbers);
          }
        });
        return booked;
      },

      isChairAvailable: (eventId, chairNumber) => {
        const booked = get().getBookedChairs(eventId);
        return !booked.includes(chairNumber);
      },

      getAvailableChairs: (eventId) => {
        const event = get().events.find((e) => e.id === eventId);
        if (!event) return [];
        const booked = get().getBookedChairs(eventId);
        const available: number[] = [];
        for (let i = 1; i <= event.totalChairs; i++) {
          if (!booked.includes(i)) available.push(i);
        }
        return available;
      },

      resetToDefault: () => set({ events: defaultEvents, tickets: [] }),
    }),
    {
      name: "foodiehub-events",
      version: 2, // 👈 Bumped for new fields
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<EventStore>;
        
        // Version 1 -> 2: Add new payment fields
        if (version < 2 && state?.tickets) {
          state.tickets = state.tickets.map((t) => ({
            ...t,
            transactionId: t.transactionId || `TXN-TKT-${t.id.slice(-6)}`,
            refundStatus: t.paymentStatus === "refunded" ? "processed" : "none",
          }));
        }
        
        return state as EventStore;
      },
    }
  )
);