import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  
  // 👇 NAYA: PRD Section 24 Payment Management
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";

  status: CelebrationStatus;
  
  // Status tracking for admin
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
    description:
      "A cozy celebration with all the essentials. Perfect for intimate gatherings.",
    features: [
      "Standard balloon decoration",
      "1 kg cake",
      "2-hour table reservation",
      "Birthday/Anniversary card",
    ],
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
    popular: false,
    isActive: true,
  },
  {
    id: "PKG002",
    name: "Premium Experience",
    price: 4999,
    description:
      "Our most loved package with premium decorations and a dedicated host.",
    features: [
      "Premium theme decoration",
      "2 kg designer cake",
      "3-hour table reservation",
      "Complimentary desserts for all",
      "Dedicated celebration host",
      "Customized wishing card",
      "Photo props",
    ],
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
    popular: true,
    isActive: true,
  },
  {
    id: "PKG003",
    name: "Deluxe VIP Package",
    price: 9999,
    description:
      "The ultimate celebration — VIP treatment with live music and exclusive perks.",
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
    image:
      "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=800",
    popular: false,
    isActive: true,
  },
];

// ================= STORE =================
type CelebrationStore = {
  packages: CelebrationPackage[];
  bookings: Celebration[];

  // Packages
  addPackage: (pkg: Omit<CelebrationPackage, "id">) => void;
  updatePackage: (id: string, updates: Partial<CelebrationPackage>) => void;
  deletePackage: (id: string) => void;
  togglePackageActive: (id: string) => void;

  // Bookings
  addBooking: (booking: Omit<Celebration, "id" | "createdAt" | "preparationStatus" | "cardStatus" | "transactionId" | "refundStatus">) => Celebration;
  updateBookingStatus: (id: string, status: CelebrationStatus) => void;
  updatePreparationStatus: (id: string, status: PreparationStatus) => void;
  updateCardStatus: (id: string, status: CardStatus) => void;
  cancelBooking: (id: string) => void;
  getBookingById: (id: string) => Celebration | undefined;
  
  // 👇 NAYA: Payment Management
  updateTransactionId: (id: string, transactionId: string) => void;
  updateRefundStatus: (id: string, status: "none" | "requested" | "processed") => void;

  resetToDefault: () => void;
};

export const useCelebrationStore = create<CelebrationStore>()(
  persist(
    (set, get) => ({
      packages: defaultPackages,
      bookings: [],

      // ============ PACKAGES ============
      addPackage: (pkg) => {
        const newPkg: CelebrationPackage = {
          ...pkg,
          id: "PKG" + Date.now().toString().slice(-6),
        };
        set({ packages: [...get().packages, newPkg] });
      },

      updatePackage: (id, updates) => {
        set({
          packages: get().packages.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
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

      // ============ BOOKINGS ============
      addBooking: (booking) => {
        const newBooking: Celebration = {
          ...booking,
          id: "CEL" + Date.now().toString().slice(-8),
          createdAt: new Date().toISOString(),
          preparationStatus: "pending",
          cardStatus: "pending",
          transactionId: `TXN-CEL-${Date.now().toString().slice(-6)}`,
          refundStatus: "none",
        };
        set({ bookings: [newBooking, ...get().bookings] });
        return newBooking;
      },

      updateBookingStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status } : b
          ),
        });
      },

      updatePreparationStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, preparationStatus: status } : b
          ),
        });
      },

      updateCardStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, cardStatus: status } : b
          ),
        });
      },

      cancelBooking: (id) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "cancelled" as CelebrationStatus,
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

      resetToDefault: () =>
        set({ packages: defaultPackages, bookings: [] }),
    }),
    {
      name: "foodiehub-celebrations",
      version: 3, // 👈 Bumped for payment fields
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as CelebrationStore;
        
        // Version 1 -> 2: Add prep/card statuses
        if (version < 2) {
          if (state?.bookings) {
            state.bookings = state.bookings.map(b => ({
              ...b,
              preparationStatus: b.preparationStatus || "pending",
              cardStatus: b.cardStatus || "pending"
            }));
          }
        }
        
        // Version 2 -> 3: Add payment management fields
        if (version < 3) {
          if (state?.bookings) {
            state.bookings = state.bookings.map((b) => ({
              ...b,
              transactionId: b.transactionId || `TXN-CEL-${b.id.slice(-6)}`,
              refundStatus: b.paymentStatus === "refunded" ? "processed" : "none",
            }));
          }
        }
        
        return state;
      }
    }
  )
);