import { create } from "zustand";
import axios from "axios";
import { CartItem } from "./cartStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

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
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  placeOrder: (orderData: any) => Promise<Order | null>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  assignDriver: (id: string, driver: DriverInfo) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,

  // 👇 1. Backend se saare orders fetch karna
  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/orders`);
      const formattedOrders = response.data.map((o: any) => ({
        ...o,
        id: o._id,
      }));
      set({ orders: formattedOrders, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ isLoading: false });
    }
  },

  // 👇 2. Naya order place karna
  placeOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      const newOrder = { ...response.data, id: response.data._id };
      set({ orders: [newOrder, ...get().orders] });
      return newOrder;
    } catch (error) {
      console.error("Error placing order:", error);
      return null;
    }
  },

  getOrderById: (id) => get().orders.find((o) => o.id === id),

  // 👇 3. Order status update karna
  updateOrderStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${id}/status`, { status });
      const updatedOrder = { ...response.data, id: response.data._id };
      set({
        orders: get().orders.map((o) => (o.id === id ? updatedOrder : o)),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  },

  // 👇 4. Driver assign karna (Hum isme status update call kar rahe hain kyunki backend me alag route nahi hai abhi)
  assignDriver: async (id, driverInfo) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${id}/status`, { 
        status: "driver-assigned",
        driverInfo // Backend me IOrder me driverInfo add karna padega, filhal ye status update karega
      });
      const updatedOrder = { ...response.data, id: response.data._id, driverInfo };
      set({
        orders: get().orders.map((o) => (o.id === id ? updatedOrder : o)),
      });
    } catch (error) {
      console.error("Error assigning driver:", error);
    }
  },

  cancelOrder: async (id) => {
    await get().updateOrderStatus(id, "cancelled");
  },
}));