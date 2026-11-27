"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Phone,
  MapPin,
  X,
  Banknote,
  CreditCard,
  User,
  ChefHat,
  UtensilsCrossed,
  UserCheck,
  ShoppingBag,
  Star,
  Car,
} from "lucide-react";
import { useOrderStore, Order, OrderStatus, DriverInfo } from "@/store/orderStore";
import { useTripStore } from "@/store/tripStore";
import toast from "react-hot-toast";

type Tab = "all" | "active" | "delivered" | "cancelled";

export default function AdminOrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const fetchOrders = useOrderStore((state) => state.fetchOrders); // 👈 NAYA
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const assignDriverToOrder = useOrderStore((state) => state.assignDriver);

  const drivers = useTripStore((state) => state.drivers);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [showDriverModal, setShowDriverModal] = useState<Order | null>(null);

  // 👇 Backend se orders fetch karne ke liye
  useEffect(() => {
    fetchOrders();
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, [fetchOrders]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading orders...</div>;
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

  let filtered = orders;
  if (activeTab === "active") {
    filtered = filtered.filter((o) => activeStatuses.includes(o.status));
  } else if (activeTab === "delivered") {
    filtered = filtered.filter((o) => o.status === "delivered");
  } else if (activeTab === "cancelled") {
    filtered = filtered.filter((o) => o.status === "cancelled");
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    );
  }

  const counts = {
    all: orders.length,
    active: orders.filter((o) => activeStatuses.includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "placed": return { label: "Placed", bg: "bg-blue-50", text: "text-blue-700", icon: Package };
      case "confirmed": return { label: "Confirmed", bg: "bg-indigo-50", text: "text-indigo-700", icon: CheckCircle2 };
      case "preparing": return { label: "Preparing", bg: "bg-yellow-50", text: "text-yellow-700", icon: ChefHat };
      case "ready": return { label: "Ready", bg: "bg-purple-50", text: "text-purple-700", icon: UtensilsCrossed };
      case "driver-assigned": return { label: "Driver Assigned", bg: "bg-cyan-50", text: "text-cyan-700", icon: UserCheck };
      case "picked-up": return { label: "Picked Up", bg: "bg-teal-50", text: "text-teal-700", icon: ShoppingBag };
      case "out-for-delivery": return { label: "Out for Delivery", bg: "bg-orange-50", text: "text-orange-700", icon: Truck };
      case "delivered": return { label: "Delivered", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 };
      case "cancelled": return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", icon: XCircle };
    }
  };

  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    placed: "confirmed",
    confirmed: "preparing",
    preparing: "ready",
    ready: "driver-assigned",
    "driver-assigned": "picked-up",
    "picked-up": "out-for-delivery",
    "out-for-delivery": "delivered",
    delivered: null,
    cancelled: null,
  };

  const handleAdvanceStatus = async (order: Order) => {
    const next = nextStatus[order.status];
    if (!next) return;

    if (next === "driver-assigned" && !order.driverInfo) {
      setShowDriverModal(order);
      return;
    }

    await updateOrderStatus(order.id, next); // 👈 API call
    toast.success(`Order marked as ${next.replace(/-/g, " ")}`);
    if (selectedOrder) setSelectedOrder({ ...order, status: next });
  };

  const handleAssignDriver = async (order: Order, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const driverInfo: DriverInfo = {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleNumber: driver.vehicleNumber,
      rating: driver.rating,
    };

    await assignDriverToOrder(order.id, driverInfo); // 👈 API call
    toast.success(`Driver ${driver.name} assigned!`);
    setShowDriverModal(null);

    if (selectedOrder) {
      setSelectedOrder({
        ...order,
        status: "driver-assigned",
        driverInfo,
      });
    }
  };

  const handleCancel = async (order: Order) => {
    if (!confirm(`Cancel order ${order.id}?`)) return;
    await updateOrderStatus(order.id, "cancelled"); // 👈 API call
    toast.success("Order cancelled");
    if (selectedOrder) setSelectedOrder({ ...order, status: "cancelled" });
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Order Management</span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">Orders</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">{orders.length} total · {counts.active} active</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {([{ key: "all", label: "All", count: counts.all }, { key: "active", label: "Active", count: counts.active }, { key: "delivered", label: "Delivered", count: counts.delivered }, { key: "cancelled", label: "Cancelled", count: counts.cancelled }] as { key: Tab; label: string; count: number }[]).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"}`}>
            {tab.label}
            <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by order ID, name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" />
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((order) => {
            const config = getStatusConfig(order.status);
            const StatusIcon = config.icon;
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const next = nextStatus[order.status];

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden">
                <div className="p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Left: Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${config.bg} ${config.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                        </span>
                        <span className="font-black text-slate-900 text-sm md:text-base">{order.id}</span>
                        <span className="text-[10px] md:text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {order.paymentStatus && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                            {order.paymentStatus}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">{order.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{order.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{itemCount} items · {order.items.map((i) => i.name).slice(0, 2).join(", ")}{order.items.length > 2 ? "..." : ""}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          {order.paymentMethod === "cod" ? <><Banknote className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>Cash on Delivery</span></> : <><CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>Online Payment</span></>}
                        </div>
                      </div>
                    </div>

                    {/* Right: Total & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 lg:min-w-[200px] mt-2 pt-3 lg:mt-0 lg:pt-0 border-t border-slate-100 lg:border-0">
                      <div className="flex items-center justify-between w-full lg:w-full">
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Total</div>
                        <div className="text-xl md:text-2xl font-black text-[#FF6B00]">₹{order.total}</div>
                      </div>
                      <div className="flex items-center gap-2 w-full lg:w-full">
                        {next && (
                          <button onClick={() => handleAdvanceStatus(order)} className="flex-1 lg:w-full flex items-center justify-center gap-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 whitespace-nowrap">
                            {order.status === "ready" ? "Assign Driver" : `Mark ${next.replace(/-/g, " ")}`}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setSelectedOrder(order)} className="p-2 md:p-2.5 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0" aria-label="View details">
                          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ ORDER DETAIL MODAL ============ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start p-5 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">Order Details</span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">{selectedOrder.id}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="p-5 md:p-6 space-y-5">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  {(() => {
                    const c = getStatusConfig(selectedOrder.status);
                    const I = c.icon;
                    return <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${c.bg} ${c.text}`}><I className="w-3.5 h-3.5" />{c.label}</span>;
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-[10px] md:text-xs font-bold uppercase text-slate-500">Total</div>
                  <div className="text-xl md:text-2xl font-black text-[#FF6B00]">₹{selectedOrder.total}</div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Customer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3"><User className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="font-semibold text-slate-900">{selectedOrder.customer.name}</span></div>
                  <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400 flex-shrink-0" /><a href={`tel:${selectedOrder.customer.phone}`} className="text-slate-700 hover:text-[#FF6B00]">+91 {selectedOrder.customer.phone}</a></div>
                  {selectedOrder.orderType === "delivery" && (
                    <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" /><span className="text-slate-700 leading-relaxed">{selectedOrder.customer.address}, {selectedOrder.customer.city} — {selectedOrder.customer.pincode}</span></div>
                  )}
                  {selectedOrder.customer.instructions && <div className="p-3 bg-yellow-50 rounded-xl text-xs text-slate-700 italic">&ldquo;{selectedOrder.customer.instructions}&rdquo;</div>}
                </div>
              </div>
              {selectedOrder.driverInfo && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Driver Assigned</h3>
                  <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-black flex-shrink-0">{selectedOrder.driverInfo.name.charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-sm truncate">{selectedOrder.driverInfo.name}</div><div className="text-xs text-slate-600 truncate">{selectedOrder.driverInfo.vehicleNumber}</div></div>
                      <a href={`tel:${selectedOrder.driverInfo.phone}`} className="p-2 bg-white rounded-xl text-cyan-600 hover:bg-cyan-100 transition-colors flex-shrink-0" aria-label="Call driver"><Phone className="w-4 h-4" /></a>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 gap-2">
                      <div className="min-w-0 flex-1"><div className="font-semibold text-sm text-slate-900 truncate">{item.name}</div><div className="text-xs text-slate-500">Qty {item.quantity}</div></div>
                      <span className="font-bold text-slate-900 whitespace-nowrap">
                        ₹{((item as any).price || item.finalPrice || 0) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                <div className="flex justify-between text-slate-600"><span>Delivery</span><span>{selectedOrder.deliveryFee === 0 ? "FREE" : `₹${selectedOrder.deliveryFee}`}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax</span><span>₹{selectedOrder.tax}</span></div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-100 text-base"><span>Total</span><span>₹{selectedOrder.total}</span></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {nextStatus[selectedOrder.status] && (
                  <button onClick={() => handleAdvanceStatus(selectedOrder)} className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 capitalize text-sm md:text-base">
                    {selectedOrder.status === "ready" ? "Assign Driver" : `Mark ${nextStatus[selectedOrder.status]!.replace(/-/g, " ")}`} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <button onClick={() => handleCancel(selectedOrder)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-sm md:text-base">Cancel Order</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DRIVER SELECTION MODAL ============ */}
      {showDriverModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowDriverModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 bg-white">
              <div><span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">Assign Driver</span><h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">Select a Driver</h2></div>
              <button onClick={() => setShowDriverModal(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-3">
              {drivers.filter((d) => d.isAvailable).length === 0 ? (
                <div className="text-center py-10"><Car className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 font-semibold">No drivers available right now.</p><p className="text-xs text-slate-400 mt-1">Please check the Drivers page or try again later.</p></div>
              ) : (
                drivers.filter((d) => d.isAvailable).map((driver) => (
                  <button key={driver.id} onClick={() => handleAssignDriver(showDriverModal, driver.id)} className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border-2 border-slate-100 hover:border-[#FF6B00] hover:bg-orange-50 transition-all text-left group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-black text-base md:text-lg flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">{driver.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 truncate">{driver.name}</div><div className="text-xs text-slate-500 mt-0.5 truncate">{driver.vehicleNumber} · {driver.vehicleType}</div><div className="text-[10px] md:text-xs text-amber-600 font-bold mt-1 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-600" />{driver.rating} rating</div></div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}