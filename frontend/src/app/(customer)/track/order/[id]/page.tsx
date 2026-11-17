"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  ChefHat,
  UtensilsCrossed,
  Truck,
  Home,
  UserCheck,
} from "lucide-react";
import { useOrderStore, OrderStatus } from "@/store/orderStore";
import LiveTracker, { TrackingStatus } from "@/components/tracking/LiveTracker";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = useOrderStore((state) => state.getOrderById(id));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useOrderStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Order not found
        </h1>
        <Link
          href="/orders"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  if (isCancelled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          Order Cancelled
        </h1>
        <p className="text-slate-500 mb-8">
          This order was cancelled. Live tracking is not available.
        </p>
        <Link
          href={`/order-success/${order.id}`}
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          View Order Details
        </Link>
      </div>
    );
  }

  const etaTime = new Date(
    new Date(order.createdAt).getTime() + 30 * 60000
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Status timeline steps
  const timelineSteps: {
    status: OrderStatus;
    label: string;
    icon: typeof Package;
  }[] = [
    { status: "placed", label: "Order Placed", icon: Package },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { status: "preparing", label: "Preparing", icon: ChefHat },
    { status: "ready", label: "Ready", icon: UtensilsCrossed },
    { status: "driver-assigned", label: "Driver Assigned", icon: UserCheck },
    { status: "picked-up", label: "Picked Up", icon: ShoppingBag },
    { status: "out-for-delivery", label: "Out for Delivery", icon: Truck },
    { status: "delivered", label: "Delivered", icon: Home },
  ];

  const currentIndex = timelineSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/order-success/${order.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#FF6B00] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order
          </Link>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                Live Order Tracking
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
                {isDelivered ? "Order Delivered" : "Track Your Order"}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                {order.id}
              </p>
            </div>
            {!isDelivered && (
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Estimated Delivery
                </div>
                <div className="text-2xl font-black text-[#FF6B00]">
                  {etaTime}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Live Tracker Component */}
          <LiveTracker
            status={order.status as TrackingStatus}
            driverInfo={order.driverInfo}
            pickupLabel="Restaurant"
            deliveryLabel={order.customer.name.split(" ")[0]}
            eta={isDelivered ? "Delivered" : `${etaTime} (approx 30 min)`}
            lastUpdated="Updates every few seconds"
          />

          {/* ============ TIMELINE ============ */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Order Progress
            </h3>

            <div className="space-y-1">
              {timelineSteps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = idx <= currentIndex;
                const isActive = idx === currentIndex && !isDelivered;
                const isLast = idx === timelineSteps.length - 1;
                const hist = order.statusHistory?.find(
                  (h) => h.status === step.status
                );

                return (
                  <div key={step.status} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isDone
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-[#FF6B00] text-white ring-4 ring-orange-100 animate-pulse"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-8 ${
                            isDone ? "bg-green-500" : "bg-slate-200"
                          }`}
                        ></div>
                      )}
                    </div>

                    <div className="pt-2.5 flex-1 min-w-0">
                      <div
                        className={`font-bold text-sm ${
                          isDone ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </div>
                      {isActive && (
                        <div className="text-[11px] text-[#FF6B00] font-semibold mt-0.5 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse"></div>
                          In progress
                        </div>
                      )}
                      {hist && isDone && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(hist.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============ DELIVERY DETAILS ============ */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Delivery Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Delivery Address
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {order.customer.address}, {order.customer.city} —{" "}
                    {order.customer.pincode}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Contact
                  </div>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-sm font-semibold text-slate-900 hover:text-[#FF6B00]"
                  >
                    +91 {order.customer.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Order Placed
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ ORDER SUMMARY ============ */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Order Items
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {order.items.length} item{order.items.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div
                  key={item.cartId}
                  className="flex justify-between gap-3 text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.selectedVariant && `${item.selectedVariant} · `}
                      Qty {item.quantity}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ₹{item.finalPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-black text-[#FF6B00] text-2xl">
                ₹{order.total}
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="mt-6">
            <Link
              href={`/order-success/${order.id}`}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
            >
              View Full Order Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}