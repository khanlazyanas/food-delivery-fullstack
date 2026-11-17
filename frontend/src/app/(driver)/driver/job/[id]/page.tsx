"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  IndianRupee,
  ShoppingBag,
  Car,
  User,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useOrderStore, OrderStatus } from "@/store/orderStore";
import { useTripStore, TripStatus } from "@/store/tripStore";
import toast from "react-hot-toast";

export default function DriverJobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const type = searchParams.get("type"); // "order" or "trip"

  const [mounted, setMounted] = useState(false);

  // Stores
  const getOrderById = useOrderStore((state) => state.getOrderById);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  
  const getTripById = useTripStore((state) => state.getTripById);
  const updateTripStatus = useTripStore((state) => state.updateTripStatus);

  useEffect(() => {
    useOrderStore.persist.rehydrate();
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-6 text-center text-slate-500">Loading job...</div>;

  const order = type === "order" ? getOrderById(id) : null;
  const trip = type === "trip" ? getTripById(id) : null;

  if (!order && !trip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h1>
        <button onClick={() => router.back()} className="text-[#FF6B00] font-bold mt-4">Go Back</button>
      </div>
    );
  }

  // ================= HELPER FUNCTIONS =================
  const openMaps = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, "_blank");
  };

  // ================= ORDER FLOW =================
  const handleOrderAction = () => {
    if (!order) return;

    if (order.status === "placed" || order.status === "confirmed") {
      updateOrderStatus(order.id, "driver-assigned");
      toast.success("Job Accepted!");
    } else if (order.status === "driver-assigned") {
      updateOrderStatus(order.id, "picked-up");
      toast.success("Order Picked Up!");
    } else if (order.status === "picked-up") {
      updateOrderStatus(order.id, "out-for-delivery");
      toast.success("Out for delivery!");
    } else if (order.status === "out-for-delivery") {
      updateOrderStatus(order.id, "delivered");
      toast.success("Order Delivered Successfully!");
      router.push("/driver");
    }
  };

  const getOrderActionLabel = () => {
    if (!order) return "";
    switch (order.status) {
      case "placed":
      case "confirmed": return "Accept Order";
      case "driver-assigned": return "Mark Picked Up";
      case "picked-up": return "Start Delivery";
      case "out-for-delivery": return "Mark Delivered";
      default: return "Update Status";
    }
  };

  // ================= TRIP FLOW =================
  const handleTripAction = () => {
    if (!trip) return;

    if (trip.status === "requested") {
      updateTripStatus(trip.id, "driver-assigned");
      toast.success("Trip Accepted!");
    } else if (trip.status === "driver-assigned") {
      updateTripStatus(trip.id, "picked-up");
      toast.success("Customer Picked Up!");
    } else if (trip.status === "picked-up") {
      updateTripStatus(trip.id, "restaurant-reached");
      toast.success("Reached Restaurant!");
    } else if (trip.status === "restaurant-reached") {
      updateTripStatus(trip.id, "return-trip");
      toast.success("Started Return Trip!");
    } else if (trip.status === "return-trip") {
      updateTripStatus(trip.id, "completed");
      toast.success("Customer Dropped Successfully!");
      router.push("/driver");
    }
  };

  const getTripActionLabel = () => {
    if (!trip) return "";
    switch (trip.status) {
      case "requested": return "Accept Trip";
      case "driver-assigned": return "Mark Picked Up";
      case "picked-up": return "Reached Restaurant";
      case "restaurant-reached": return "Start Return Trip";
      case "return-trip": return "Complete Drop";
      default: return "Update Status";
    }
  };

  const currentStatus = order?.status || trip?.status;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-screen overflow-hidden">
      
      {/* Header */}
      <header className="bg-white p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push("/driver")} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Job Details</div>
          <div className="font-mono text-sm font-black text-slate-900">{id}</div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            {type === "order" ? <ShoppingBag className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
            {currentStatus?.replace("-", " ")}
          </span>
        </div>

        {/* Payment Card (For Orders) */}
        {order && (
          <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${order.paymentMethod === "cod" ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.paymentMethod === "cod" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Payment</div>
                <div className="font-bold text-slate-900">
                  {order.paymentMethod === "cod" ? "Collect Cash" : "Prepaid Online"}
                </div>
              </div>
            </div>
            <div className={`text-xl font-black ${order.paymentMethod === "cod" ? "text-amber-700" : "text-green-700"}`}>
              ₹{order.total}
            </div>
          </div>
        )}

        {/* Trip Payment */}
        {trip && (
          <div className="p-4 rounded-2xl border-2 bg-slate-100 border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-slate-700 shadow-sm">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Trip Fare</div>
                <div className="font-bold text-slate-900">
                  {trip.paymentMethod === "cod" ? "Collect Cash" : "Prepaid"}
                </div>
              </div>
            </div>
            <div className="text-xl font-black text-slate-900">₹{trip.serviceCharges}</div>
          </div>
        )}

        {/* Locations */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5">
          {/* Pickup */}
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Location</div>
              <div className="font-bold text-slate-900 text-sm leading-tight mb-2">
                {order ? "FoodieHub Restaurant (Kitchen)" : trip?.pickupLocation}
              </div>
              <button 
                onClick={() => openMaps(order ? "FoodieHub Restaurant" : trip?.pickupLocation || "")}
                className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <Navigation className="w-3 h-3" /> Navigate
              </button>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-slate-200 h-4 ml-4 -my-2"></div>

          {/* Drop */}
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Navigation className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Drop Location</div>
              <div className="font-bold text-slate-900 text-sm leading-tight mb-2">
                {order ? `${order.customer.address}, ${order.customer.city}` : trip?.returnLocation}
              </div>
              <button 
                onClick={() => openMaps(order ? order.customer.address : trip?.returnLocation || "")}
                className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <Navigation className="w-3 h-3" /> Navigate
              </button>
            </div>
          </div>
        </div>

        {/* Customer Details & Call */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Customer</div>
              <div className="font-bold text-slate-900">{order?.customer.name || trip?.customer.name}</div>
            </div>
          </div>
          <a 
            href={`tel:${order?.customer.phone || trip?.customer.phone}`}
            className="w-10 h-10 bg-green-100 text-green-600 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Note */}
        {order?.customer.instructions && (
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl">
            <div className="text-[10px] font-bold text-yellow-700 uppercase mb-1">Customer Note</div>
            <p className="text-sm text-slate-800 italic">&ldquo;{order.customer.instructions}&rdquo;</p>
          </div>
        )}

      </div>

      {/* Action Button Fixed Bottom */}
      <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <button
          onClick={order ? handleOrderAction : handleTripAction}
          className="w-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6" />
          {order ? getOrderActionLabel() : getTripActionLabel()}
        </button>
        <p className="text-center text-[10px] text-slate-400 font-semibold mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Status updates automatically notify Admin & Customer
        </p>
      </div>
    </div>
  );
}