import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "./cartStore";

// ================= ORDER STATUS FLOW (PRD 5) =================
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "driver-assigned"
  | "picked-up"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

// ================= PAYMENT STATUS =================
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// ================= DRIVER INFO =================
export type DriverInfo = {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  vehicleNumber?: string;
  rating?: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    instructions?: string;
  };
  orderType: "delivery" | "pickup";
  paymentMethod: "cod" | "online";
  paymentStatus: PaymentStatus;
  
  // 👇 NAYA: PRD Section 24 Payment Management
  transactionId?: string;
  refundStatus?: "none" | "requested" | "processed";

  status: OrderStatus;
  driverInfo?: DriverInfo;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt?: string;
  statusHistory?: {
    status: OrderStatus;
    timestamp: string;
  }[];
};

type OrderStore = {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  assignDriver: (id: string, driver: DriverInfo) => void;
  cancelOrder: (id: string) => void;
  getOrderTimeline: (id: string) => { status: OrderStatus; timestamp: string }[];
  
  // 👇 NAYA: Payment Management functions
  updateTransactionId: (id: string, transactionId: string) => void;
  updateRefundStatus: (id: string, status: "none" | "requested" | "processed") => void;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        const now = new Date().toISOString();
        const enrichedOrder: Order = {
          ...order,
          updatedAt: now,
          paymentStatus:
            order.paymentMethod === "online" ? "paid" : "pending",
          transactionId: `TXN-ORD-${Date.now().toString().slice(-6)}`, // Auto-generate
          refundStatus: "none", // Default
          statusHistory: [
            { status: order.status, timestamp: order.createdAt || now },
          ],
        };
        set({ orders: [enrichedOrder, ...get().orders] });
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      updateOrderStatus: (id, status) => {
        const now = new Date().toISOString();
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  updatedAt: now,
                  statusHistory: [
                    ...(o.statusHistory || []),
                    { status, timestamp: now },
                  ],
                }
              : o
          ),
        });
      },

      updatePaymentStatus: (id, paymentStatus) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? { ...o, paymentStatus, updatedAt: new Date().toISOString() }
              : o
          ),
        });
      },

      assignDriver: (id, driverInfo) => {
        const now = new Date().toISOString();
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  driverInfo,
                  status: "driver-assigned" as OrderStatus,
                  updatedAt: now,
                  statusHistory: [
                    ...(o.statusHistory || []),
                    { status: "driver-assigned" as OrderStatus, timestamp: now },
                  ],
                }
              : o
          ),
        });
      },

      cancelOrder: (id) => {
        const now = new Date().toISOString();
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: "cancelled" as OrderStatus,
                  paymentStatus: o.paymentStatus === "paid" ? "refunded" : o.paymentStatus,
                  refundStatus: o.paymentStatus === "paid" ? "requested" : "none", // 👈 Auto Refund Request
                  updatedAt: now,
                  statusHistory: [
                    ...(o.statusHistory || []),
                    { status: "cancelled" as OrderStatus, timestamp: now },
                  ],
                }
              : o
          ),
        });
      },

      getOrderTimeline: (id) => {
        const order = get().orders.find((o) => o.id === id);
        return order?.statusHistory || [];
      },

      // 👇 NAYA: Payment functions
      updateTransactionId: (id, transactionId) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, transactionId } : o
          ),
        });
      },

      updateRefundStatus: (id, status) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, refundStatus: status } : o
          ),
        });
      },
    }),
    {
      name: "foodiehub-orders",
      version: 4, // 👈 Bumped for Payment Management
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { orders: Order[] };
        
        if (version < 4 && state?.orders) {
          // v1/v2/v3 se v4 me upgrade
          const migratedOrders = state.orders.map((o) => ({
            ...o,
            transactionId: o.transactionId || `TXN-ORD-${o.id.slice(-6)}`,
            refundStatus: o.paymentStatus === "refunded" ? "processed" : "none",
            paymentStatus:
              o.paymentStatus ||
              (o.paymentMethod === "online" ? "paid" : "pending"),
            updatedAt: o.updatedAt || o.createdAt,
            statusHistory: o.statusHistory || [
              { status: o.status, timestamp: o.createdAt },
            ],
          }));
          return { orders: migratedOrders } as unknown as OrderStore;
        }
        
        return persistedState as OrderStore;
      },
    }
  )
);