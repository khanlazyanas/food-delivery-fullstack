"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Copy,
  Check,
  ArrowRight,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  MessageSquare,
  Navigation,
  Car,
  Loader2,
  Star,
  Home,
  Flag,
  Building2,
  RotateCcw,
  Radio,
} from "lucide-react";
import { useTripStore, Trip, TripStatus } from "@/store/tripStore";
import toast from "react-hot-toast";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const trip = useTripStore((state) => state.trips.find((t) => t.id === id));
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const handleCopyId = () => {
    if (trip) {
      navigator.clipboard.writeText(trip.id);
      setCopied(true);
      toast.success("Trip ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Trip not found
        </h1>
        <Link
          href="/pick-drop"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Book a Trip
        </Link>
      </div>
    );
  }

  const isCancelled = trip.status === "cancelled";
  const isCompleted = trip.status === "completed";
  const tripDate = new Date(trip.pickupDate);

  // 👇 Show Track Live if trip is active
  const showTrackLive = !isCancelled && !isCompleted;

  // Full timeline steps
  const timelineSteps: {
    status: TripStatus;
    label: string;
    desc: string;
    icon: typeof Car;
  }[] = [
    {
      status: "requested",
      label: "Request Placed",
      desc: "Your trip request received",
      icon: CheckCircle2,
    },
    {
      status: "driver-assigned",
      label: "Driver Assigned",
      desc: "A driver has been assigned",
      icon: User,
    },
    {
      status: "driver-en-route",
      label: "Driver En Route",
      desc: "On the way to pickup",
      icon: Navigation,
    },
    {
      status: "picked-up",
      label: "Picked Up",
      desc: "You're on the way to restaurant",
      icon: Car,
    },
    {
      status: "restaurant-reached",
      label: "Restaurant Reached",
      desc: "Enjoy your meal!",
      icon: Building2,
    },
    {
      status: "return-trip",
      label: "Return Trip",
      desc: "On the way home",
      icon: RotateCcw,
    },
    {
      status: "completed",
      label: "Dropped Off",
      desc: "You've been dropped off safely",
      icon: Home,
    },
  ];

  const currentIndex = timelineSteps.findIndex((s) => s.status === trip.status);

  const getStepState = (index: number) => {
    if (isCancelled) {
      return index < currentIndex ? "done" : "pending";
    }
    if (index < currentIndex) return "done";
    if (index === currentIndex) return "active";
    return "pending";
  };

  const getStatusConfig = () => {
    switch (trip.status) {
      case "requested":
        return {
          label: "Requested",
          hero: "Trip Requested",
          message: "We'll assign a driver shortly",
          color: "text-amber-500",
          bg: "bg-amber-100",
        };
      case "driver-assigned":
        return {
          label: "Driver Assigned",
          hero: "Driver Assigned",
          message: "Your driver is preparing to pick you up",
          color: "text-cyan-500",
          bg: "bg-cyan-100",
        };
      case "driver-en-route":
        return {
          label: "Driver En Route",
          hero: "Driver On The Way",
          message: "Your driver is heading to your location",
          color: "text-blue-500",
          bg: "bg-blue-100",
        };
      case "picked-up":
        return {
          label: "Picked Up",
          hero: "You're On The Way",
          message: "Heading to FoodieHub — enjoy the ride!",
          color: "text-orange-500",
          bg: "bg-orange-100",
        };
      case "restaurant-reached":
        return {
          label: "At Restaurant",
          hero: "Enjoy Your Meal!",
          message: "We'll pick you up when you're ready",
          color: "text-purple-500",
          bg: "bg-purple-100",
        };
      case "return-trip":
        return {
          label: "Return Trip",
          hero: "Heading Home",
          message: "Taking you back safely",
          color: "text-indigo-500",
          bg: "bg-indigo-100",
        };
      case "completed":
        return {
          label: "Completed",
          hero: "Trip Completed",
          message: "Thanks for riding with FoodieHub!",
          color: "text-green-500",
          bg: "bg-green-100",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          hero: "Trip Cancelled",
          message: "Refund will be processed if applicable",
          color: "text-red-500",
          bg: "bg-red-100",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            {isCancelled ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : (
              <Car className="w-12 h-12 text-[#FF6B00]" />
            )}
          </div>

          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase opacity-90 mb-3">
            {statusConfig.hero}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
            {trip.customer.name.split(" ")[0]}&apos;s
            <br />
            <span className="text-white">Trip</span>
          </h1>

          <p className="text-lg opacity-95 max-w-lg mx-auto mb-6">
            {statusConfig.message}
          </p>

          {/* 👇 Track Live Button (Hero) */}
          {showTrackLive && (
            <Link
              href={`/track/trip/${trip.id}`}
              className="inline-flex items-center gap-2 bg-white text-[#FF6B00] hover:bg-slate-100 font-black px-6 py-3.5 rounded-full transition-all shadow-2xl hover:scale-105"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              Track Live
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-10 lg:py-14 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 👇 Live Tracking Prominent Card */}
          {showTrackLive && (
            <Link
              href={`/track/trip/${trip.id}`}
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
                    Track Your Trip Live
                  </div>
                  <div className="text-xs text-white/70 mt-0.5">
                    See driver on map · Real-time status updates
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Trip ID Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Trip ID
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {trip.id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Copy trip ID"
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
                  ₹{trip.serviceCharges}
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment:
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  trip.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : trip.paymentStatus === "refunded"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {trip.paymentStatus}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                via{" "}
                {trip.paymentMethod === "cod"
                  ? "Pay to Driver"
                  : "Online Payment"}
              </span>
            </div>
          </div>

          {/* Driver Info */}
          {trip.driverInfo && !isCancelled && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                <Car className="w-5 h-5 text-[#FF6B00]" />
                Your Driver
              </h3>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-cyan-50 to-white rounded-2xl border border-cyan-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
                  {trip.driverInfo.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">
                    {trip.driverInfo.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {trip.driverInfo.vehicleNumber} · {trip.driverInfo.vehicleType}
                  </div>
                  <div className="text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-600" />
                    {trip.driverInfo.rating} rating
                  </div>
                </div>
                <a
                  href={`tel:${trip.driverInfo.phone}`}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              </div>
            </div>
          )}

          {/* Trip Timeline */}
          {!isCancelled && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">
                Trip Progress
              </h3>

              <div className="space-y-1">
                {timelineSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const state = getStepState(idx);
                  const isLast = idx === timelineSteps.length - 1;
                  const hist = trip.statusHistory.find(
                    (h) => h.status === step.status
                  );

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
                            className={`w-0.5 h-10 ${
                              state === "done" ? "bg-green-500" : "bg-slate-200"
                            }`}
                          ></div>
                        )}
                      </div>

                      <div className="pt-1.5 flex-1 min-w-0">
                        <div
                          className={`font-bold text-sm ${
                            state !== "pending"
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div
                          className={`text-xs ${
                            state !== "pending"
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {step.desc}
                        </div>
                        {state === "active" && (
                          <div className="text-[11px] text-[#FF6B00] font-semibold mt-0.5 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse"></div>
                            Current Status
                          </div>
                        )}
                        {hist && state !== "pending" && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(hist.timestamp).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        )}
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
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-red-900 mb-1">
                    Trip Cancelled
                  </div>
                  <p className="text-sm text-red-700">
                    {trip.paymentStatus === "refunded"
                      ? "Your payment has been refunded. It may take 3-5 business days to reflect."
                      : "This trip request was cancelled."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Trip Details
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Pickup Location
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {trip.pickupLocation}
                  </div>
                </div>
              </div>

              <div className="ml-5 pl-6 border-l-2 border-dashed border-slate-300 h-4"></div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Destination
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    FoodieHub Restaurant
                  </div>
                </div>
              </div>

              <div className="ml-5 pl-6 border-l-2 border-dashed border-slate-300 h-4"></div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Return / Drop Location
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {trip.returnLocation}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Calendar className="w-4 h-4 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Date
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {tripDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Clock className="w-4 h-4 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Time
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {trip.pickupTime}
                </div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Users className="w-4 h-4 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Passengers
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {trip.passengers}
                </div>
              </div>
            </div>

            {trip.customer.specialRequests && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Special Requests
                    </div>
                    <p className="text-sm text-slate-700 italic">
                      &ldquo;{trip.customer.specialRequests}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Contact Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                    Name
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {trip.customer.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                    Phone
                  </div>
                  <a
                    href={`tel:${trip.customer.phone}`}
                    className="text-sm font-semibold text-slate-900 hover:text-[#FF6B00]"
                  >
                    +91 {trip.customer.phone}
                  </a>
                </div>
              </div>

              {trip.customer.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                      Email
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {trip.customer.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* 👇 Track Live button (secondary position) */}
            {showTrackLive && (
              <Link
                href={`/track/trip/${trip.id}`}
                className="w-full flex items-center justify-center gap-2 bg-[#3D1C00] hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg group"
              >
                <Navigation className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                Track Trip Live
              </Link>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/my-trips"
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
              >
                My Trips <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pick-drop"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border border-slate-200 transition-all"
              >
                Book New Trip
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}