"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  User,
  Navigation,
  Building2,
  Home,
  RotateCcw,
  UserCheck,
  Users,
  MessageSquare,
} from "lucide-react";
import { useTripStore, TripStatus } from "@/store/tripStore";
import LiveTracker, { TrackingStatus } from "@/components/tracking/LiveTracker";

export default function TripTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const trip = useTripStore((state) => state.trips.find((t) => t.id === id));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Trip not found
        </h1>
        <Link
          href="/my-trips"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          View My Trips
        </Link>
      </div>
    );
  }

  const isCompleted = trip.status === "completed";
  const isCancelled = trip.status === "cancelled";

  if (isCancelled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Car className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          Trip Cancelled
        </h1>
        <p className="text-slate-500 mb-8">
          This trip was cancelled. Live tracking is not available.
        </p>
        <Link
          href={`/my-trips/${trip.id}`}
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          View Trip Details
        </Link>
      </div>
    );
  }

  const tripDate = new Date(trip.pickupDate);

  // Timeline steps for trip
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
      icon: UserCheck,
    },
    {
      status: "driver-en-route",
      label: "Driver En Route",
      desc: "On the way to pick you up",
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

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/my-trips/${trip.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#FF6B00] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Trip
          </Link>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                Live Trip Tracking
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
                {isCompleted ? "Trip Completed" : "Track Your Trip"}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                {trip.id}
              </p>
            </div>
            {!isCompleted && (
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Pickup Time
                </div>
                <div className="text-2xl font-black text-[#FF6B00]">
                  {trip.pickupTime}
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
            status={trip.status as TrackingStatus}
            driverInfo={
              trip.driverInfo
                ? {
                    name: trip.driverInfo.name,
                    phone: trip.driverInfo.phone,
                    vehicleNumber: trip.driverInfo.vehicleNumber,
                    vehicleType: trip.driverInfo.vehicleType,
                    rating: trip.driverInfo.rating,
                  }
                : undefined
            }
            pickupLabel="Your Location"
            deliveryLabel="Home"
            eta={
              isCompleted
                ? "Completed"
                : `Pickup at ${trip.pickupTime}`
            }
            lastUpdated="Updates every few seconds"
          />

          {/* ============ TIMELINE ============ */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Trip Progress
            </h3>

            <div className="space-y-1">
              {timelineSteps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = idx <= currentIndex;
                const isActive = idx === currentIndex && !isCompleted;
                const isLast = idx === timelineSteps.length - 1;
                const hist = trip.statusHistory?.find(
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
                          className={`w-0.5 h-10 ${
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
                      <div
                        className={`text-xs ${
                          isDone ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {step.desc}
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

          {/* ============ ROUTE DETAILS ============ */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Route Details
            </h3>

            <div className="space-y-5">
              {/* Pickup */}
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

              {/* Route line */}
              <div className="ml-5 pl-6 border-l-2 border-dashed border-slate-300 h-4"></div>

              {/* Restaurant stop */}
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

              {/* Route line */}
              <div className="ml-5 pl-6 border-l-2 border-dashed border-slate-300 h-4"></div>

              {/* Drop */}
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

            {/* Trip meta */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Clock className="w-4 h-4 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Pickup
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
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Car className="w-4 h-4 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Vehicle
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {trip.driverInfo?.vehicleType || "—"}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">
                {tripDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* ============ SPECIAL REQUESTS ============ */}
          {trip.customer.specialRequests && (
            <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
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

          {/* ============ CONTACT ============ */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Contact
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                    Passenger
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
            </div>
          </div>

          {/* Action */}
          <div className="mt-6">
            <Link
              href={`/my-trips/${trip.id}`}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
            >
              View Full Trip Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}