"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Filter,
  Navigation,
  ArrowRight,
  Home,
  Building2,
  RotateCcw,
} from "lucide-react";
import { useTripStore, Trip, TripStatus } from "@/store/tripStore";

type Tab = "upcoming" | "past" | "cancelled";

export default function MyTripsPage() {
  const trips = useTripStore((state) => state.trips);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  useEffect(() => {
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  const isPastTrip = (trip: Trip) => {
    const tripDateTime = new Date(`${trip.pickupDate}T${trip.pickupTime}`);
    return tripDateTime < new Date() || trip.status === "completed";
  };

  const isActive = (trip: Trip) =>
    trip.status !== "completed" && trip.status !== "cancelled";

  const filteredTrips = trips.filter((t) => {
    if (activeTab === "upcoming") return isActive(t) && !isPastTrip(t);
    if (activeTab === "past") return t.status === "completed";
    if (activeTab === "cancelled") return t.status === "cancelled";
    return true;
  });

  const counts = {
    upcoming: trips.filter((t) => isActive(t) && !isPastTrip(t)).length,
    past: trips.filter((t) => t.status === "completed").length,
    cancelled: trips.filter((t) => t.status === "cancelled").length,
  };

  const getStatusConfig = (status: TripStatus) => {
    switch (status) {
      case "requested":
        return {
          label: "Requested",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: Clock,
        };
      case "driver-assigned":
        return {
          label: "Driver Assigned",
          bg: "bg-cyan-50",
          text: "text-cyan-700",
          border: "border-cyan-200",
          icon: CheckCircle2,
        };
      case "driver-en-route":
        return {
          label: "Driver En Route",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: Navigation,
        };
      case "picked-up":
        return {
          label: "Picked Up",
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
          icon: Car,
        };
      case "restaurant-reached":
        return {
          label: "At Restaurant",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          icon: Building2,
        };
      case "return-trip":
        return {
          label: "Return Trip",
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border: "border-indigo-200",
          icon: RotateCcw,
        };
      case "completed":
        return {
          label: "Completed",
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: CheckCircle2,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: XCircle,
        };
    }
  };

  // Empty state
  if (trips.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <Car className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
          No trips yet
        </h1>
        <p className="text-slate-500 mb-8">
          You haven&apos;t booked any Pick & Drop trips yet.
        </p>
        <Link
          href="/pick-drop"
          className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
        >
          Book a Trip <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
                Your Rides
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
                My Trips
              </h1>
            </div>
            <Link
              href="/pick-drop"
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30"
            >
              <Car className="w-4 h-4" /> Book New
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
            {(
              [
                { key: "upcoming", label: "Active", count: counts.upcoming },
                { key: "past", label: "Completed", count: counts.past },
                { key: "cancelled", label: "Cancelled", count: counts.cancelled },
              ] as { key: Tab; label: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-white/25 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRIPS LIST ================= */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {filteredTrips.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No {activeTab} trips
              </h3>
              <p className="text-sm text-slate-500">
                {activeTab === "upcoming" && "No active trips right now"}
                {activeTab === "past" && "Your completed trips will appear here"}
                {activeTab === "cancelled" && "No cancelled trips"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips.map((trip) => {
                const statusConfig = getStatusConfig(trip.status);
                const StatusIcon = statusConfig.icon;
                const tripDate = new Date(trip.pickupDate);

                return (
                  <Link
                    key={trip.id}
                    href={`/my-trips/${trip.id}`}
                    className="group block bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden"
                  >
                    {/* Status Strip */}
                    <div
                      className={`flex items-center justify-between px-5 py-3 border-b ${statusConfig.bg} ${statusConfig.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {trip.id}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        
                        {/* Left: Route */}
                        <div className="flex-1 min-w-0">
                          {/* Date + Passengers top row */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span className="font-bold">
                                {tripDate.toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <span className="text-slate-300">·</span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span className="font-bold">{trip.pickupTime}</span>
                            </div>
                            <span className="text-slate-300">·</span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Users className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span className="font-bold">
                                {trip.passengers} pax
                              </span>
                            </div>
                          </div>

                          {/* Route */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm text-slate-700 truncate">
                                {trip.pickupLocation}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Home className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm text-slate-700 truncate">
                                {trip.returnLocation}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount + Arrow */}
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-between">
                          <div className="sm:text-right">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                              Total
                            </div>
                            <div className="text-2xl font-black text-[#FF6B00]">
                              ₹{trip.serviceCharges}
                            </div>
                            <span
                              className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                                trip.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : trip.paymentStatus === "refunded"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {trip.paymentStatus}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
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