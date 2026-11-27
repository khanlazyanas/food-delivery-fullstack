import { create } from "zustand";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ================= TYPES =================
export type OccasionType = "birthday" | "anniversary" | "other";

export type CelebrationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PreparationStatus = "pending" | "decorating" | "preparing" | "ready";
export type CardStatus = "pending" | "designing" | "printed" | "delivered";

export type CelebrationPackage = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  popular?: boolean;
  isActive: boolean;
};

export type Celebration = {
  id: string;
  occasion: OccasionType;
  celebrantName: string;
  celebrantPhoto?: string;
  packageId: string;
  packageName: string;
  date: string;
  time: string;
  guests: number;
  specialMessage: string;
  specialRequests?: string;
  totalPrice: number;
  advancePaid: number;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";
  status: CelebrationStatus;
  preparationStatus: PreparationStatus;
  cardStatus: CardStatus;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  createdAt: string;
};

// ================= DEFAULT PACKAGES =================
const defaultPackages: CelebrationPackage[] = [
  {
    id: "PKG001",
    name: "Classic Celebration",
    price: 1999,
    description: "A cozy celebration with all the essentials. Perfect for intimate gatherings.",
    features: [
      "Standard balloon decoration",
      "1 kg cake",
      "2-hour table reservation",
      "Birthday/Anniversary card",
    ],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
    popular: false,
    isActive: true,
  },
  {
    id: "PKG002",
    name: "Premium Experience",
    price: 4999,
    description: "Our most loved package with premium decorations and a dedicated host.",
    features: [
      "Premium theme decoration",
      "2 kg designer cake",
      "3-hour table reservation",
      "Complimentary desserts for all",
      "Dedicated celebration host",
      "Customized wishing card",
      "Photo props",
    ],
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
    popular: true,
    isActive: true,
  },
  {
    id: "PKG003",
    name: "Deluxe VIP Package",
    price: 9999,
    description: "The ultimate celebration — VIP treatment with live music and exclusive perks.",
    features: [
      "Luxury VIP area decoration",
      "3 kg custom cake",
      "5-hour VIP table reservation",
      "Live music performance",
      "Complimentary meal for all guests",
      "Professional photographer (1 hr)",
      "Personalized gifts",
      "Dedicated event coordinator",
    ],
    image: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=800",
    popular: false,
    isActive: true,
  },
];

type CelebrationStore = {
  packages: CelebrationPackage[];
  bookings: Celebration[];
  isLoading: boolean;

  // Fetch Data
  fetchBookings: () => Promise<void>;

  // Packages (Local static for now)
  addPackage: (pkg: Omit<CelebrationPackage, "id">) => void;
  updatePackage: (id: string, updates: Partial<CelebrationPackage>) => void;
  deletePackage: (id: string) => void;
  togglePackageActive: (id: string) => void;

  // Bookings (API)
  addBooking: (bookingData: any) => Promise<Celebration | null>;
  updateBookingStatus: (id: string, status: CelebrationStatus) => Promise<void>;
  updatePreparationStatus: (id: string, status: PreparationStatus) => Promise<void>;
  updateCardStatus: (id: string, status: CardStatus) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  getBookingById: (id: string) => Celebration | undefined;
};

export const useCelebrationStore = create<CelebrationStore>((set, get) => ({
  packages: defaultPackages,
  bookings: [],
  isLoading: false,

  // ============ FETCH ============
  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/celebrations`);
      const formattedBookings = response.data.map((b: any) => ({
        ...b,
        id: b._id,
        transactionId: b.transactionId || `TXN-CEL-${b._id.slice(-6)}`,
        refundStatus: b.paymentStatus === "refunded" ? "processed" : "none",
      }));
      set({ bookings: formattedBookings, isLoading: false });
    } catch (error) {
      console.error("Error fetching celebrations:", error);
      set({ isLoading: false });
    }
  },

  // ============ PACKAGES (LOCAL) ============
  addPackage: (pkg) => {
    const newPkg: CelebrationPackage = {
      ...pkg,
      id: "PKG" + Date.now().toString().slice(-6),
    };
    set({ packages: [...get().packages, newPkg] });
  },
  updatePackage: (id, updates) => {
    set({
      packages: get().packages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  },
  deletePackage: (id) => {
    set({ packages: get().packages.filter((p) => p.id !== id) });
  },
  togglePackageActive: (id) => {
    set({
      packages: get().packages.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ),
    });
  },

  // ============ BOOKINGS (API) ============
  addBooking: async (bookingData) => {
    try {
      const response = await axios.post(`${API_URL}/celebrations`, bookingData);
      const newBooking = {
        ...response.data,
        id: response.data._id,
        transactionId: `TXN-CEL-${response.data._id.slice(-6)}`,
        refundStatus: "none",
      };
      set({ bookings: [newBooking, ...get().bookings] });
      return newBooking;
    } catch (error) {
      console.error("Error adding celebration:", error);
      return null;
    }
  },

  updateBookingStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/celebrations/${id}/status`, { status });
      const updated = response.data;
      set({
        bookings: get().bookings.map((b) =>
          b.id === id ? { ...b, status: updated.status, paymentStatus: updated.paymentStatus } : b
        ),
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  },

  updatePreparationStatus: async (id, status) => {
    try {
      await axios.put(`${API_URL}/celebrations/${id}/preparation`, { preparationStatus: status });
      set({
        bookings: get().bookings.map((b) =>
          b.id === id ? { ...b, preparationStatus: status } : b
        ),
      });
    } catch (error) {
      console.error("Error updating prep status:", error);
    }
  },

  updateCardStatus: async (id, status) => {
    try {
      await axios.put(`${API_URL}/celebrations/${id}/card`, { cardStatus: status });
      set({
        bookings: get().bookings.map((b) =>
          b.id === id ? { ...b, cardStatus: status } : b
        ),
      });
    } catch (error) {
      console.error("Error updating card status:", error);
    }
  },

  cancelBooking: async (id) => {
    await get().updateBookingStatus(id, "cancelled");
  },

  getBookingById: (id) => get().bookings.find((b) => b.id === id),
}));