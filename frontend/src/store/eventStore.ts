import { create } from "zustand";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ================= TYPES =================
export type Event = {
  id: string;
  name: string;
  banner: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  rules: string;
  ticketPrice: number;
  totalChairs: number;
  isActive: boolean;
  createdAt?: string;
};

export type Ticket = {
  id: string;
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
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";
  status: "confirmed" | "cancelled" | "checked-in";
  createdAt: string;
  checkedInAt?: string;
};

type EventStore = {
  events: Event[];
  tickets: Ticket[];
  isLoading: boolean;

  // Fetch APIs
  fetchEvents: () => Promise<void>;
  fetchTickets: () => Promise<void>;

  // Event management
  addEvent: (event: Omit<Event, "id" | "createdAt">) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleEventActive: (id: string) => Promise<void>;

  // Ticket management
  addTicket: (ticket: any) => Promise<Ticket | null>;
  cancelTicket: (id: string) => Promise<void>;
  checkInTicket: (id: string) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;

  // Availability
  getBookedChairs: (eventId: string) => number[];
  isChairAvailable: (eventId: string, chairNumber: number) => boolean;
  getAvailableChairs: (eventId: string) => number[];
};

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  tickets: [],
  isLoading: false,

  // ============ FETCH ============
  fetchEvents: async () => {
    try {
      const response = await axios.get(`${API_URL}/events`);
      const formattedEvents = response.data.map((e: any) => ({
        ...e,
        id: e._id,
      }));
      set({ events: formattedEvents });
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  },

  fetchTickets: async () => {
    try {
      const response = await axios.get(`${API_URL}/events/tickets`);
      const formattedTickets = response.data.map((t: any) => ({
        ...t,
        id: t._id,
        eventId: t.event,
        transactionId: t.transactionId || `TXN-TKT-${t._id.slice(-6)}`,
        refundStatus: t.paymentStatus === "refunded" ? "processed" : "none",
      }));
      set({ tickets: formattedTickets });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  },

  // ============ EVENT MANAGEMENT ============
  addEvent: async (event) => {
    try {
      const response = await axios.post(`${API_URL}/events`, event);
      const newEvent = { ...response.data, id: response.data._id };
      set({ events: [newEvent, ...get().events] });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/events/${id}`, updates);
      const updatedEvent = { ...response.data, id: response.data._id };
      set({
        events: get().events.map((e) => (e.id === id ? updatedEvent : e)),
      });
    } catch (error) {
      console.error("Error updating event:", error);
    }
  },

  deleteEvent: async (id) => {
    try {
      await axios.delete(`${API_URL}/events/${id}`);
      set({ events: get().events.filter((e) => e.id !== id) });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  },

  toggleEventActive: async (id) => {
    try {
      const event = get().events.find((e) => e.id === id);
      if (!event) return;
      const response = await axios.put(`${API_URL}/events/${id}`, {
        isActive: !event.isActive,
      });
      const updatedEvent = { ...response.data, id: response.data._id };
      set({
        events: get().events.map((e) => (e.id === id ? updatedEvent : e)),
      });
    } catch (error) {
      console.error("Error toggling active:", error);
    }
  },

  // ============ TICKET MANAGEMENT ============
  addTicket: async (ticketData) => {
    try {
      const response = await axios.post(`${API_URL}/events/tickets`, ticketData);
      const newTicket = {
        ...response.data,
        id: response.data._id,
        eventId: ticketData.eventId,
        advancePercent: ticketData.advancePercent,
      };
      set({ tickets: [newTicket, ...get().tickets] });
      return newTicket;
    } catch (error) {
      console.error("Error adding ticket:", error);
      return null;
    }
  },

  cancelTicket: async (id) => {
    // Backend me cancel ka route nahi hai abhi, isliye local state update kar rahe hain (ya status update API use kar sakte hain)
    try {
      // Assuming backend has a cancel route or we just update local state
      set({
        tickets: get().tickets.map((t) =>
          t.id === id
            ? {
                ...t,
                status: "cancelled",
                paymentStatus: t.paymentStatus === "paid" ? "refunded" : t.paymentStatus,
                refundStatus: t.paymentStatus === "paid" ? "requested" : "none",
              }
            : t
        ),
      });
    } catch (error) {
      console.error("Error cancelling ticket:", error);
    }
  },

  checkInTicket: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/events/tickets/${id}/checkin`);
      const updatedTicket = { ...response.data, id: response.data._id };
      set({
        tickets: get().tickets.map((t) => (t.id === id ? updatedTicket : t)),
      });
    } catch (error) {
      console.error("Error checking in ticket:", error);
    }
  },

  getTicketById: (id) => get().tickets.find((t) => t.id === id),

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
}));