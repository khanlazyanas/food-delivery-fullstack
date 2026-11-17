"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Car,
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  XCircle,
  CheckCircle2,
  X,
  Phone,
  User,
  UserCheck,
  Navigation,
  Building2,
  Home,
  RotateCcw,
  IndianRupee,
  Star,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  useTripStore,
  Trip,
  TripStatus,
} from "@/store/tripStore";
import toast from "react-hot-toast";

type Tab = "all" | "active" | "completed" | "cancelled";

export default function AdminTripsPage() {
  const trips = useTripStore((state) => state.trips);
  const drivers = useTripStore((state) => state.drivers);
  const updateTripStatus = useTripStore((state) => state.updateTripStatus);
  const assignDriver = useTripStore((state) => state.assignDriver);
  const cancelTrip = useTripStore((state) => state.cancelTrip);
  const resetToDefault = useTripStore((state) => state.resetToDefault);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDriverModal, setShowDriverModal] = useState<Trip | null>(null);

  useEffect(() => {
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading trips...</div>;
  }

  const activeStatuses: TripStatus[] = [
    "requested",
    "driver-assigned",
    "driver-en-route",
    "picked-up",
    "restaurant-reached",
    "return-trip",
  ];

  let filtered = trips;
  if (activeTab === "active") {
    filtered = filtered.filter((t) => activeStatuses.includes(t.status));
  } else if (activeTab === "completed") {
    filtered = filtered.filter((t) => t.status === "completed");
  } else if (activeTab === "cancelled") {
    filtered = filtered.filter((t) => t.status === "cancelled");
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.customer.name.toLowerCase().includes(q) ||
        t.customer.phone.includes(q) ||
        t.pickupLocation.toLowerCase().includes(q)
    );
  }

  const counts = {
    all: trips.length,
    active: trips.filter((t) => activeStatuses.includes(t.status)).length,
    completed: trips.filter((t) => t.status === "completed").length,
    cancelled: trips.filter((t) => t.status === "cancelled").length,
  };

  const totalRevenue = trips
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.serviceCharges, 0);

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
          icon: UserCheck,
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

  const nextStatus: Record<TripStatus, TripStatus | null> = {
    requested: "driver-assigned",
    "driver-assigned": "driver-en-route",
    "driver-en-route": "picked-up",
    "picked-up": "restaurant-reached",
    "restaurant-reached": "return-trip",
    "return-trip": "completed",
    completed: null,
    cancelled: null,
  };

  const handleAdvanceStatus = (trip: Trip) => {
    if (trip.status === "requested" && !trip.driverId) {
      setShowDriverModal(trip);
      return;
    }
    const next = nextStatus[trip.status];
    if (!next) return;
    updateTripStatus(trip.id, next);
    toast.success(`Trip marked as ${next.replace(/-/g, " ")}`);
    if (selectedTrip) setSelectedTrip({ ...trip, status: next });
  };

  const handleAssignDriver = (trip: Trip, driverId: string) => {
    assignDriver(trip.id, driverId);
    const driver = drivers.find((d) => d.id === driverId);
    toast.success(`Driver ${driver?.name} assigned`);
    setShowDriverModal(null);
    if (selectedTrip) {
      const updated = { ...trip, driverId, driverInfo: driver };
      setSelectedTrip(updated);
    }
  };

  const handleCancel = (trip: Trip) => {
    if (!confirm(`Cancel trip ${trip.id}?`)) return;
    cancelTrip(trip.id);
    toast.success("Trip cancelled");
    if (selectedTrip) setSelectedTrip({ ...trip, status: "cancelled" });
  };

  const handleReset = () => {
    if (!confirm("Reset all trips and drivers to default? This will delete all trip records.")) return;
    resetToDefault();
    toast.success("Trips reset to default");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Pick &amp; Drop Management
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
            Trips
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            {trips.length} total · {counts.active} active
          </p>
        </div>

        <button
          onClick={handleReset}
          className="w-full lg:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
              <Car className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total Trips
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {counts.all}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
            {counts.active} active
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Active Now
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {counts.active}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">in progress</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Completed
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {counts.completed}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">all-time</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Revenue
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 truncate">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">excl. cancelled</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {(
          [
            { key: "all", label: "All", count: counts.all },
            { key: "active", label: "Active", count: counts.active },
            { key: "completed", label: "Completed", count: counts.completed },
            { key: "cancelled", label: "Cancelled", count: counts.cancelled },
          ] as { key: Tab; label: string; count: number }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by trip ID, customer or pickup location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Trips List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No trips found</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((trip) => {
            const config = getStatusConfig(trip.status);
            const StatusIcon = config.icon;
            const next = nextStatus[trip.status];
            const tripDate = new Date(trip.pickupDate);

            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${config.bg} ${config.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <span className="font-mono font-black text-slate-900 text-sm md:text-base">
                          {trip.id}
                        </span>
                        <span className="text-[10px] md:text-xs text-slate-500">
                          {new Date(trip.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 text-sm mb-3">
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 min-w-0">
                          <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 text-[11px] md:text-sm truncate">
                            {trip.customer.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 min-w-0">
                          <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-[11px] md:text-sm truncate">{trip.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 min-w-0">
                          <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-[11px] md:text-sm truncate">
                            {tripDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            · {trip.pickupTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 min-w-0">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-[11px] md:text-sm truncate">{trip.passengers} pax</span>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-600 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="font-semibold truncate max-w-[120px] md:max-w-[200px]">
                          {trip.pickupLocation}
                        </span>
                        <span className="text-slate-300">→</span>
                        <Home className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold truncate max-w-[120px] md:max-w-[200px]">
                          {trip.returnLocation}
                        </span>
                      </div>

                      {/* Driver badge (if assigned) */}
                      {trip.driverInfo && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full border border-cyan-200">
                            <Car className="w-3 h-3" />
                            <span className="font-bold text-[10px] md:text-xs truncate max-w-[100px] md:max-w-none">
                              {trip.driverInfo.name}
                            </span>
                            <span className="opacity-70 text-[10px] md:text-xs hidden sm:inline">
                              · {trip.driverInfo.vehicleNumber}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 lg:min-w-[200px] mt-2 pt-3 lg:mt-0 lg:pt-0 border-t border-slate-100 lg:border-0">
                      
                      <div className="flex items-center justify-between w-full lg:w-full">
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                          Total
                        </div>
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-black text-[#FF6B00]">
                            ₹{trip.serviceCharges}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            trip.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : trip.paymentStatus === "refunded"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {trip.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full lg:w-full">
                        {next && (
                          <button
                            onClick={() => handleAdvanceStatus(trip)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-orange-500/30 whitespace-nowrap"
                          >
                            {trip.status === "requested"
                              ? "Assign Driver"
                              : `Mark ${next.replace(/-/g, " ")}`}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="p-2 md:p-2.5 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0"
                          aria-label="View details"
                        >
                          <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
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

      {/* ============ DRIVER ASSIGNMENT MODAL ============ */}
      {showDriverModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowDriverModal(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  Assign Driver
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {showDriverModal.id}
                </h2>
              </div>
              <button
                onClick={() => setShowDriverModal(null)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-3">
              <p className="text-[10px] md:text-sm text-slate-500 mb-4">
                Select a driver to assign to this trip
              </p>

              {drivers.filter((d) => d.isAvailable).length === 0 ? (
                <div className="text-center py-8 bg-amber-50 rounded-2xl border border-amber-200">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-amber-900">
                    No available drivers
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    All drivers are currently busy
                  </p>
                </div>
              ) : (
                drivers
                  .filter((d) => d.isAvailable)
                  .map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() =>
                        handleAssignDriver(showDriverModal, driver.id)
                      }
                      className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border-2 border-slate-200 hover:border-[#FF6B00] hover:bg-orange-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-black text-base md:text-lg flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {driver.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                          {driver.vehicleNumber} · {driver.vehicleType}
                        </div>
                        <div className="text-[10px] md:text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-600" />
                          {driver.rating}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ TRIP DETAIL MODAL ============ */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  Trip Details
                </span>
                <h2 className="font-mono text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedTrip.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-5">
              {/* Status + Total */}
              <div className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-2xl">
                <div>
                  {(() => {
                    const c = getStatusConfig(selectedTrip.status);
                    const I = c.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${c.bg} ${c.text}`}
                      >
                        <I className="w-3.5 h-3.5" />
                        {c.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-[10px] md:text-xs font-bold uppercase text-slate-500">
                    Total
                  </div>
                  <div className="text-xl md:text-2xl font-black text-[#FF6B00]">
                    ₹{selectedTrip.serviceCharges}
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Customer
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">
                      {selectedTrip.customer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={`tel:${selectedTrip.customer.phone}`}
                      className="text-slate-700 hover:text-[#FF6B00]"
                    >
                      +91 {selectedTrip.customer.phone}
                    </a>
                  </div>
                  {selectedTrip.customer.specialRequests && (
                    <div className="p-3 bg-yellow-50 rounded-xl text-xs text-slate-700 italic mt-2">
                      &ldquo;{selectedTrip.customer.specialRequests}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Route */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Route
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">
                        Pickup
                      </div>
                      <div className="font-semibold text-slate-900 text-xs md:text-sm">
                        {selectedTrip.pickupLocation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">
                        Drop
                      </div>
                      <div className="font-semibold text-slate-900 text-xs md:text-sm">
                        {selectedTrip.returnLocation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip info grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold mb-0.5">
                    Date
                  </div>
                  <div className="font-semibold text-slate-900 text-xs md:text-sm">
                    {new Date(selectedTrip.pickupDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                      }
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold mb-0.5">
                    Time
                  </div>
                  <div className="font-semibold text-slate-900 text-xs md:text-sm">
                    {selectedTrip.pickupTime}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold mb-0.5">
                    Passengers
                  </div>
                  <div className="font-semibold text-slate-900 text-xs md:text-sm">
                    {selectedTrip.passengers}
                  </div>
                </div>
              </div>

              {/* Driver */}
              {selectedTrip.driverInfo && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Driver
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-100 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-black flex-shrink-0">
                      {selectedTrip.driverInfo.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-xs md:text-sm truncate">
                        {selectedTrip.driverInfo.name}
                      </div>
                      <div className="text-[10px] md:text-xs text-slate-600 truncate">
                        {selectedTrip.driverInfo.vehicleNumber}
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedTrip.driverInfo.phone}`}
                      className="p-2 bg-white rounded-lg text-cyan-600 hover:bg-cyan-100 transition-colors flex-shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {selectedTrip.status === "requested" &&
                  !selectedTrip.driverInfo && (
                    <button
                      onClick={() => {
                        setShowDriverModal(selectedTrip);
                        setSelectedTrip(null);
                      }}
                      className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <UserCheck className="w-4 h-4" />
                      Assign Driver
                    </button>
                  )}
                {nextStatus[selectedTrip.status] &&
                  selectedTrip.driverInfo && (
                    <button
                      onClick={() => handleAdvanceStatus(selectedTrip)}
                      className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 capitalize text-sm md:text-base"
                    >
                      Mark{" "}
                      {nextStatus[selectedTrip.status]!.replace(/-/g, " ")}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                {selectedTrip.status !== "cancelled" &&
                  selectedTrip.status !== "completed" && (
                    <button
                      onClick={() => handleCancel(selectedTrip)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
                    >
                      Cancel Trip
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}