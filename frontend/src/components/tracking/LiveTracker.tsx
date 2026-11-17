"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Navigation,
  Car,
  Home,
  Building2,
  Clock,
  Phone,
  Star,
  User,
  CheckCircle2,
  Radio,
  Signal,
  Battery,
} from "lucide-react";

export type TrackingStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "driver-assigned"
  | "picked-up"
  | "out-for-delivery"
  | "delivered"
  | "requested"
  | "driver-en-route"
  | "restaurant-reached"
  | "return-trip"
  | "completed";

type DriverInfo = {
  name: string;
  phone: string;
  vehicleNumber?: string;
  vehicleType?: string;
  rating?: number;
};

type Props = {
  status: TrackingStatus;
  driverInfo?: DriverInfo;
  pickupLabel: string; // Restaurant / Pickup location
  deliveryLabel: string; // Customer / Drop location
  eta?: string;
  lastUpdated?: string;
};

// Calculate progress along route (0-100) based on status
const getProgress = (status: TrackingStatus): number => {
  switch (status) {
    case "placed":
      return 0;
    case "confirmed":
      return 5;
    case "preparing":
      return 15;
    case "ready":
      return 25;
    case "driver-assigned":
      return 35;
    case "driver-en-route":
      return 50;
    case "picked-up":
      return 65;
    case "out-for-delivery":
      return 75;
    case "restaurant-reached":
      return 50;
    case "return-trip":
      return 75;
    case "delivered":
    case "completed":
      return 100;
    default:
      return 0;
  }
};

export default function LiveTracker({
  status,
  driverInfo,
  pickupLabel,
  deliveryLabel,
  eta,
  lastUpdated,
}: Props) {
  const [progress, setProgress] = useState(getProgress(status));
  const [pulse, setPulse] = useState(0);

  // Smoothly animate progress
  useEffect(() => {
    const target = getProgress(status);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) return target;
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [status]);

  // Pulse animation for driver dot
  useEffect(() => {
    const timer = setInterval(() => setPulse((p) => (p + 1) % 2), 800);
    return () => clearInterval(timer);
  }, []);

  const isDelivered = status === "delivered" || status === "completed";
  const isLive = !isDelivered && status !== "placed";

  // Driver position along the diagonal route
  // Restaurant at top-left (20%, 25%), Customer at bottom-right (80%, 75%)
  const driverX = 20 + (progress / 100) * 60;
  const driverY = 25 + (progress / 100) * 50;

  return (
    <div className="space-y-6">
      
      {/* ============ LIVE BADGE ============ */}
      {isLive && (
        <div className="flex items-center justify-between gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <div className="text-sm font-black text-green-900">
                Live Tracking Active
              </div>
              <div className="text-[11px] text-green-700">
                {lastUpdated || "Updating in real-time"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-green-700">
            <Signal className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* ============ MAP VIEW ============ */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 h-80 sm:h-96">
        
        {/* Map grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,116,139,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Fake roads */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {/* Route path */}
          <path
            d="M 20 25 Q 50 20 50 50 T 80 75"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="0.5"
            strokeDasharray="1 1"
          />
          {/* Active route (progress) */}
          <path
            d="M 20 25 Q 50 20 50 50 T 80 75"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 100} ${100 - (progress / 100) * 100}`}
            className="transition-all duration-500"
          />
        </svg>

        {/* Pickup marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: "20%", top: "25%" }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white px-2 py-1 rounded-lg shadow-md whitespace-nowrap">
              <span className="text-[10px] font-black text-slate-900">
                {pickupLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Destination marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: "80%", top: "75%" }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white px-2 py-1 rounded-lg shadow-md whitespace-nowrap">
              <span className="text-[10px] font-black text-slate-900">
                {deliveryLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Driver marker (animated) */}
        {isLive && driverInfo && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out"
            style={{ left: `${driverX}%`, top: `${driverY}%` }}
          >
            <div className="relative">
              {/* Pulse rings */}
              {pulse === 0 && (
                <>
                  <div className="absolute inset-0 w-16 h-16 -translate-x-2 -translate-y-2 bg-[#FF6B00]/30 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-12 h-12 -translate-x-1 -translate-y-1 bg-[#FF6B00]/40 rounded-full animate-pulse"></div>
                </>
              )}
              {/* Driver icon */}
              <div className="relative w-12 h-12 bg-[#3D1C00] rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                <Car className="w-6 h-6 text-[#FF6B00]" />
              </div>
              {/* "You/Driver" label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[#3D1C00] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap">
                {driverInfo.name.split(" ")[0]}
              </div>
            </div>
          </div>
        )}

        {/* Delivered overlay */}
        {isDelivered && (
          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[1px] flex items-center justify-center z-30">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <div className="font-black text-slate-900 text-lg">
                  Delivered!
                </div>
                <div className="text-xs text-slate-500">
                  Thanks for choosing us
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom info bar */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isDelivered ? "Delivered" : "ETA"}
                </div>
                <div className="text-sm font-black text-slate-900 truncate">
                  {isDelivered ? "On time ✓" : eta || "Calculating..."}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 flex-shrink-0">
              <Radio className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
              {isDelivered ? "Complete" : "Live"}
            </div>
          </div>
        </div>

        {/* Progress bar on top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/50 z-10">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B00] to-green-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* ============ DRIVER INFO CARD ============ */}
      {driverInfo && !isDelivered && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Your Delivery Partner
            </h3>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] text-white flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
              {driverInfo.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">
                {driverInfo.name}
              </div>
              {driverInfo.vehicleNumber && (
                <div className="text-xs text-slate-500 mt-0.5">
                  {driverInfo.vehicleNumber}
                  {driverInfo.vehicleType && ` · ${driverInfo.vehicleType}`}
                </div>
              )}
              {driverInfo.rating && (
                <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-1">
                  <Star className="w-3 h-3 fill-amber-600" />
                  {driverInfo.rating} rating
                </div>
              )}
            </div>
            <a
              href={`tel:${driverInfo.phone}`}
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex-shrink-0"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        </div>
      )}
    </div>
  );
}