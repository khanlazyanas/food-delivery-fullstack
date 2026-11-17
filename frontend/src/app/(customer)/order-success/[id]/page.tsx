"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Truck,
  Home,
  ArrowRight,
  Copy,
  Check,
  ChefHat,
  UtensilsCrossed,
  UserCheck,
  ShoppingBag,
  Download,
  User,
  Printer,
  Navigation,
  Radio,
} from "lucide-react";
import { useOrderStore, OrderStatus } from "@/store/orderStore";
import toast from "react-hot-toast";

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = useOrderStore((state) => state.getOrderById(id));
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    useOrderStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const handleCopyId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.success("Order ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    const invoice = `
========================================
         FOODIEHUB INVOICE
========================================
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString("en-IN")}
Status: ${order.status.toUpperCase()}
Payment: ${order.paymentMethod.toUpperCase()} - ${order.paymentStatus?.toUpperCase()}

---------- CUSTOMER ----------
Name: ${order.customer.name}
Phone: ${order.customer.phone}
${order.orderType === "delivery" ? `Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}` : "Pickup from restaurant"}

---------- ITEMS ----------
${order.items
  .map(
    (item) =>
      `${item.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ""} x ${item.quantity} = ₹${item.finalPrice * item.quantity}`
  )
  .join("\n")}

---------- SUMMARY ----------
Subtotal: ₹${order.subtotal}
Delivery Fee: ${order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
Tax: ₹${order.tax}
----------------------------------------
TOTAL: ₹${order.total}
========================================

Thank you for ordering with FoodieHub! 🍔
    `.trim();

    const blob = new Blob([invoice], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FoodieHub-Invoice-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  };

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Order not found
        </h1>
        <Link
          href="/menu"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  const deliveryTime = new Date(
    new Date(order.createdAt).getTime() + 30 * 60000
  );
  const timeString = deliveryTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  // 👇 Show Track Live if order is active
  const showTrackLive = !isCancelled && !isDelivered;

  const getStepState = (index: number) => {
    if (isCancelled) {
      return index <= currentIndex ? "done" : "pending";
    }
    if (index < currentIndex) return "done";
    if (index === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            {isCancelled ? (
              <Package className="w-12 h-12 text-red-500" />
            ) : isDelivered ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : (
              <Clock className="w-12 h-12 text-[#FF6B00]" />
            )}
          </div>

          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase opacity-90 mb-3">
            {isCancelled
              ? "Order Cancelled"
              : isDelivered
              ? "Order Delivered"
              : "Order Confirmed"}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
            {isCancelled ? (
              <>
                Order
                <br />
                <span className="text-white">Cancelled</span>
              </>
            ) : isDelivered ? (
              <>
                Enjoy your
                <br />
                <span className="text-white">meal! 🎉</span>
              </>
            ) : (
              <>
                Thank you,
                <br />
                <span className="text-white">
                  {order.customer.name.split(" ")[0]}! 🎉
                </span>
              </>
            )}
          </h1>

          <p className="text-lg opacity-95 max-w-lg mx-auto mb-6">
            {isCancelled
              ? "Your order has been cancelled. Any payment will be refunded within 3-5 business days."
              : isDelivered
              ? "Your order has been delivered. We hope you enjoyed it!"
              : "Your order has been received and is now being prepared by our kitchen."}
          </p>

          {/* 👇 Track Live Button (Hero) */}
          {showTrackLive && (
            <Link
              href={`/track/order/${order.id}`}
              className="inline-flex items-center gap-2 bg-white text-[#FF6B00] hover:bg-slate-100 font-black px-6 py-3.5 rounded-full transition-all shadow-2xl hover:scale-105"
            >
              <div className="relative">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              Track Live
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="py-10 lg:py-14 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 👇 Live Tracking Prominent Card */}
          {showTrackLive && (
            <Link
              href={`/track/order/${order.id}`}
              className="group block bg-gradient-to-br from-[#3D1C00] to-slate-900 rounded-3xl p-6 border border-[#FF6B00]/30 shadow-2xl mb-6 overflow-hidden relative hover:scale-[1.01] transition-transform"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/30 rounded-full blur-[80px]"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-[#FF6B00] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/50">
                  <Navigation className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                      Live Now
                    </span>
                  </div>
                  <div className="text-lg font-black text-white">
                    Track Your Order Live
                  </div>
                  <div className="text-xs text-white/70 mt-0.5">
                    See your driver on the map · Real-time status updates
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Order ID + Total Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Order ID
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {order.id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Copy order ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Total
                </div>
                <div className="text-3xl font-black text-[#FF6B00]">
                  ₹{order.total}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment:
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : order.paymentStatus === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : order.paymentStatus === "refunded"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.paymentStatus || "pending"}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                via {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
              </span>
            </div>
          </div>

          {/* ================= Order Tracking Timeline ================= */}
          {!isCancelled && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl mb-6 border border-orange-100">
                <div className="w-12 h-12 bg-[#FF6B00] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    {isDelivered
                      ? "Delivered At"
                      : order.orderType === "delivery"
                      ? "Estimated Delivery"
                      : "Ready for Pickup"}
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {timeString}{" "}
                    {!isDelivered && (
                      <span className="text-sm font-semibold text-slate-500">
                        (approx 30 min)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {timelineSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const state = getStepState(idx);
                  const isLast = idx === timelineSteps.length - 1;

                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            state === "done"
                              ? "bg-green-500 text-white"
                              : state === "active"
                              ? "bg-[#FF6B00] text-white ring-4 ring-orange-100 animate-pulse"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 ${
                              state === "done" ? "bg-green-500" : "bg-slate-200"
                            }`}
                          ></div>
                        )}
                      </div>

                      <div className="pt-2.5 flex-1 min-w-0">
                        <div
                          className={`font-bold text-sm ${
                            state !== "pending"
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </div>
                        {state === "active" && (
                          <div className="text-[11px] text-[#FF6B00] font-semibold mt-0.5">
                            ● Current Status
                          </div>
                        )}
                        {state === "done" &&
                          order.statusHistory &&
                          (() => {
                            const hist = order.statusHistory.find(
                              (h) => h.status === step.status
                            );
                            if (!hist) return null;
                            return (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {new Date(hist.timestamp).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled message */}
          {isCancelled && (
            <div className="bg-red-50 rounded-3xl p-6 border border-red-200 mb-6">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-red-900 mb-1">
                    Order Cancelled
                  </div>
                  <p className="text-sm text-red-700">
                    {order.paymentStatus === "refunded"
                      ? "Your payment has been refunded. It may take 3-5 business days to reflect."
                      : "If you paid online, the refund will be processed within 3-5 business days."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Driver Info */}
          {order.driverInfo && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#FF6B00]" />
                Your Delivery Partner
              </h3>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-cyan-50 to-white rounded-2xl border border-cyan-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                  {order.driverInfo.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">
                    {order.driverInfo.name}
                  </div>
                  {order.driverInfo.vehicleNumber && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {order.driverInfo.vehicleNumber}
                    </div>
                  )}
                  {order.driverInfo.rating && (
                    <div className="text-xs text-amber-600 font-bold mt-1">
                      ★ {order.driverInfo.rating} rating
                    </div>
                  )}
                </div>
                <a
                  href={`tel:${order.driverInfo.phone}`}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              </div>
            </div>
          )}

          {/* Delivery Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">
              {order.orderType === "delivery"
                ? "Delivery Details"
                : "Pickup Details"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    {order.orderType === "delivery" ? "Address" : "Pickup From"}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {order.orderType === "delivery"
                      ? `${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}`
                      : "FoodieHub Restaurant"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Contact
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {order.customer.name} · {order.customer.phone}
                  </div>
                </div>
              </div>

              {order.customer.instructions && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Instructions
                    </div>
                    <div className="text-sm text-slate-700 italic">
                      &ldquo;{order.customer.instructions}&rdquo;
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">
              Your Items
            </h3>

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
                    {item.instructions && (
                      <div className="text-[10px] text-orange-600 italic mt-0.5">
                        &ldquo;{item.instructions}&rdquo;
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ₹{item.finalPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{order.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${order.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="font-semibold text-slate-900">₹{order.tax}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-black text-slate-900 text-xl">
                  ₹{order.total}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            
            {/* 👇 Track Live button (secondary position) */}
            {showTrackLive && (
              <Link
                href={`/track/order/${order.id}`}
                className="w-full flex items-center justify-center gap-2 bg-[#3D1C00] hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg group"
              >
                <Navigation className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                Track Order Live
              </Link>
            )}

            <button
              onClick={handleDownloadInvoice}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border-2 border-slate-200 transition-all group"
            >
              <Download className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
              Download Invoice
            </button>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/orders"
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
              >
                View All Orders <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/menu"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border border-slate-200 transition-all"
              >
                Order More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}