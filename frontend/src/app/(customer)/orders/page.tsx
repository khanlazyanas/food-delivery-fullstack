"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  ChevronRight,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  Filter,
  ChefHat,
  UtensilsCrossed,
  UserCheck,
  RotateCcw,
  FileText,
} from "lucide-react";
import { useOrderStore, OrderStatus, Order } from "@/store/orderStore";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

type Tab = "active" | "completed" | "cancelled";

export default function OrdersPage() {
  const router = useRouter();
  const orders = useOrderStore((state) => state.orders);
  const fetchOrders = useOrderStore((state) => state.fetchOrders); // 👈 Naya Backend API
  const addItem = useCartStore((state) => state.addItem);
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders(); // 👈 Backend se data fetch
    setMounted(true);
  }, [fetchOrders]);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  const activeStatuses: OrderStatus[] = [
    "placed",
    "confirmed",
    "preparing",
    "ready",
    "driver-assigned",
    "picked-up",
    "out-for-delivery",
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return activeStatuses.includes(order.status);
    }
    if (activeTab === "completed") {
      return order.status === "delivered";
    }
    if (activeTab === "cancelled") {
      return order.status === "cancelled";
    }
    return true;
  });

  const counts = {
    active: orders.filter((o) => activeStatuses.includes(o.status)).length,
    completed: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "placed": return { label: "Placed", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Package };
      case "confirmed": return { label: "Confirmed", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: CheckCircle2 };
      case "preparing": return { label: "Preparing", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: ChefHat };
      case "ready": return { label: "Ready", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: UtensilsCrossed };
      case "driver-assigned": return { label: "Driver Assigned", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: UserCheck };
      case "picked-up": return { label: "Picked Up", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: ShoppingBag };
      case "out-for-delivery": return { label: "Out for Delivery", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: Truck };
      case "delivered": return { label: "Delivered", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 };
      case "cancelled": return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
    }
  };

  const handleReorder = (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();

    if (order.items.length === 0) {
      toast.error("No items to reorder");
      return;
    }

    setReorderingId(order.id);
    let addedCount = 0;

    order.items.forEach((item) => {
      addedCount += item.quantity;
    });

    toast.success(`${addedCount} item${addedCount > 1 ? "s" : ""} will be reordered`);
    setTimeout(() => {
      setReorderingId(null);
      router.push("/menu");
    }, 800);
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">No orders yet</h1>
        <p className="text-slate-500 mb-8">You haven&apos;t placed any orders. Let&apos;s change that!</p>
        <Link href="/menu" className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">Track & Review</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">My Orders</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">{orders.length} {orders.length === 1 ? "order" : "orders"} total</p>
          </div>

          <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
            {([{ key: "active", label: "Active", count: counts.active }, { key: "completed", label: "Completed", count: counts.completed }, { key: "cancelled", label: "Cancelled", count: counts.cancelled }] as { key: Tab; label: string; count: number }[]).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab.key ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-white text-slate-600"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ORDERS LIST */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4"><Filter className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No {activeTab} orders</h3>
              <p className="text-sm text-slate-500">
                {activeTab === "active" && "You don't have any active orders right now"}
                {activeTab === "completed" && "Your completed orders will appear here"}
                {activeTab === "cancelled" && "You don't have any cancelled orders"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                const isReorderable = order.status === "delivered" || order.status === "cancelled";

                return (
                  <Link key={order.id} href={`/order-success/${order.id}`} className="group block bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden">
                    {/* Top Strip */}
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${statusConfig.bg} ${statusConfig.border}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}>{statusConfig.label}</span>
                        {order.paymentStatus && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "pending" ? "bg-amber-100 text-amber-700" : order.paymentStatus === "refunded" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                            {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "pending" ? "Pay on Delivery" : order.paymentStatus}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Order ID</span>
                            <span className="font-black text-slate-900">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                            <span className="text-slate-300">·</span>
                            <span className="truncate">
                              {order.items.map((i) => i.name).slice(0, 2).join(", ")}
                              {order.items.length > 2 && ` +${order.items.length - 2} more`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.items.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {order.items.length > 4 && <div className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">+{order.items.length - 4}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
                          <div className="sm:text-right">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total</div>
                            <div className="text-2xl font-black text-[#FF6B00]">₹{order.total}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isReorderable && (
                              <button onClick={(e) => handleReorder(e, order)} disabled={reorderingId === order.id} className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-300 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-lg shadow-orange-500/30 whitespace-nowrap">
                                <RotateCcw className="w-3.5 h-3.5" /> Reorder
                              </button>
                            )}
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>

                      {order.status === "delivered" && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Order delivered</span>
                          <span className="text-slate-300">·</span>
                          <Link href={`/order-success/${order.id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1">
                            <FileText className="w-3 h-3" /> View Invoice
                          </Link>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}