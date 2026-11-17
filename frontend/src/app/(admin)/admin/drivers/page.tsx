"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Search,
  X,
  Check,
  Phone,
  User,
  Car,
  Users,
  Shield,
  History,
  Package,
  Navigation,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useTripStore, Driver } from "@/store/tripStore";
import { useOrderStore } from "@/store/orderStore";
import toast from "react-hot-toast";

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Tempo Traveller"];

export default function AdminDriversPage() {
  const drivers = useTripStore((state) => state.drivers);
  const trips = useTripStore((state) => state.trips);
  const addDriver = useTripStore((state) => state.addDriver);
  const updateDriver = useTripStore((state) => state.updateDriver);
  const deleteDriver = useTripStore((state) => state.deleteDriver);
  const toggleDriverAvailability = useTripStore(
    (state) => state.toggleDriverAvailability
  );
  const resetToDefault = useTripStore((state) => state.resetToDefault);

  const orders = useOrderStore((state) => state.orders);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "available" | "busy"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const [historyDriver, setHistoryDriver] = useState<Driver | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicleNumber: "",
    vehicleType: "Sedan",
    rating: 4.5,
    isAvailable: true,
  });

  useEffect(() => {
    useTripStore.persist.rehydrate();
    useOrderStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        phone: editing.phone,
        vehicleNumber: editing.vehicleNumber,
        vehicleType: editing.vehicleType,
        rating: editing.rating,
        isAvailable: editing.isAvailable,
      });
    } else {
      setForm({
        name: "",
        phone: "",
        vehicleNumber: "",
        vehicleType: "Sedan",
        rating: 4.5,
        isAvailable: true,
      });
    }
  }, [editing, showForm]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading drivers...</div>;
  }

  let filtered = drivers;
  if (availabilityFilter === "available") {
    filtered = filtered.filter((d) => d.isAvailable);
  } else if (availabilityFilter === "busy") {
    filtered = filtered.filter((d) => !d.isAvailable);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.vehicleNumber.toLowerCase().includes(q)
    );
  }

  const stats = {
    total: drivers.length,
    available: drivers.filter((d) => d.isAvailable).length,
    busy: drivers.filter((d) => !d.isAvailable).length,
    avgRating:
      drivers.length > 0
        ? (
            drivers.reduce((s, d) => s + d.rating, 0) / drivers.length
          ).toFixed(1)
        : "0.0",
  };

  const getActiveJobsCount = (driverId: string) => {
    const activeTrips = trips.filter(
      (t) =>
        t.driverId === driverId &&
        !["completed", "cancelled"].includes(t.status)
    ).length;
    const activeOrders = orders.filter(
      (o) =>
        o.driverInfo?.id === driverId &&
        !["delivered", "cancelled"].includes(o.status)
    ).length;
    return activeTrips + activeOrders;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter driver name");
      return;
    }
    if (form.phone.length !== 10) {
      toast.error("Enter valid 10-digit phone");
      return;
    }
    if (!form.vehicleNumber.trim()) {
      toast.error("Please enter vehicle number");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    if (editing) {
      updateDriver(editing.id, form);
      toast.success("Driver updated");
    } else {
      addDriver(form);
      toast.success("Driver added");
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const activeJobs = getActiveJobsCount(id);
    if (activeJobs > 0) {
      toast.error(
        `Cannot delete — ${activeJobs} active job(s) assigned`
      );
      setConfirmDelete(null);
      return;
    }
    deleteDriver(id);
    setConfirmDelete(null);
    toast.success("Driver deleted");
  };

  const handleReset = () => {
    if (
      !confirm(
        "Reset drivers to default? This will delete all trips and custom drivers."
      )
    )
      return;
    resetToDefault();
    toast.success("Drivers reset to default");
  };

  const getDriverHistory = (driverId: string) => {
    const driverTrips = trips.filter((t) => t.driverId === driverId);
    const driverOrders = orders.filter((o) => o.driverInfo?.id === driverId);

    const activeTrips = driverTrips.filter(t => !["completed", "cancelled"].includes(t.status));
    const completedTrips = driverTrips.filter(t => t.status === "completed");
    
    const activeOrders = driverOrders.filter(o => !["delivered", "cancelled"].includes(o.status));
    const completedOrders = driverOrders.filter(o => o.status === "delivered");

    return { activeTrips, completedTrips, activeOrders, completedOrders };
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Fleet Management
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
            Drivers
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Manage your delivery and pickup drivers
          </p>
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total Drivers
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">in fleet</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Available
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.available}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">ready to go</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Car className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Busy
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.busy}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">on trip</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Avg Rating
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.avgRating}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">out of 5</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone or vehicle number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {(["all", "available", "busy"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAvailabilityFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all capitalize whitespace-nowrap ${
                availabilityFilter === f
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No drivers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((driver) => {
            const activeJobs = getActiveJobsCount(driver.id);

            return (
              <div
                key={driver.id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Header strip */}
                <div
                  className={`px-4 py-3 md:px-5 border-b flex items-center justify-between ${
                    driver.isAvailable
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      toggleDriverAvailability(driver.id);
                      toast.success(
                        driver.isAvailable
                          ? "Driver marked busy"
                          : "Driver marked available"
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                      driver.isAvailable
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                  >
                    {driver.isAvailable ? (
                      <>
                        <Check className="w-3 h-3" /> Available
                      </>
                    ) : (
                      <>
                        <Car className="w-3 h-3" /> On Trip
                      </>
                    )}
                  </button>
                  {activeJobs > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {activeJobs} active
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-3 md:gap-4 mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-black text-lg md:text-xl shadow-lg flex-shrink-0">
                      {driver.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-black text-slate-900 truncate">
                        {driver.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-700" />
                          {driver.rating}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono truncate">
                          {driver.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Car className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-slate-900">
                          {driver.vehicleNumber}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          · {driver.vehicleType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <a
                        href={`tel:${driver.phone}`}
                        className="text-slate-700 hover:text-[#FF6B00] truncate"
                      >
                        +91 {driver.phone}
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setHistoryDriver(driver)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#3D1C00] hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <History className="w-3.5 h-3.5" /> History
                    </button>
                    <button
                      onClick={() => {
                        setEditing(driver);
                        setShowForm(true);
                      }}
                      className="p-2.5 text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(driver.id)}
                      className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors bg-slate-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ FORM MODAL ============ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  {editing ? "Update" : "New"}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {editing ? "Edit Driver" : "Add Driver"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Vehicle Number * (e.g., MH 01 AB 1234)"
                  value={form.vehicleNumber}
                  onChange={(e) =>
                    setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all font-mono text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VEHICLE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, vehicleType: type })}
                      className={`p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                        form.vehicleType === type
                          ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> Rating
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Available for Trips
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Only available drivers can be assigned
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.isAvailable ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.isAvailable ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({ ...form, isAvailable: e.target.checked })
                  }
                  className="hidden"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm md:text-base"
                >
                  {editing ? "Update" : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 md:p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Delete this driver?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              This action can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DRIVER HISTORY MODAL ============ */}
      {historyDriver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setHistoryDriver(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center font-black text-base md:text-lg shadow-md flex-shrink-0">
                  {historyDriver.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                    Driver History
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
                    {historyDriver.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setHistoryDriver(null)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6 md:space-y-8">
              {(() => {
                const { activeTrips, completedTrips, activeOrders, completedOrders } = getDriverHistory(historyDriver.id);
                const hasAnyJob = activeTrips.length > 0 || completedTrips.length > 0 || activeOrders.length > 0 || completedOrders.length > 0;

                if (!hasAnyJob) {
                  return (
                    <div className="text-center py-10">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-semibold">No jobs assigned yet.</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Active Jobs */}
                    {(activeOrders.length > 0 || activeTrips.length > 0) && (
                      <div>
                        <h3 className="text-xs md:text-sm font-black text-slate-900 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" /> Active Jobs
                        </h3>
                        <div className="space-y-2">
                          {activeOrders.map((o) => (
                            <Link key={o.id} href={`/admin/orders`} className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-slate-900 truncate">Food Delivery - {o.id}</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase flex-shrink-0">{o.status}</span>
                              </div>
                            </Link>
                          ))}
                          {activeTrips.map((t) => (
                            <Link key={t.id} href={`/admin/trips`} className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Navigation className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-slate-900 truncate">Pick & Drop - {t.id}</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded uppercase flex-shrink-0">{t.status.replace("-", " ")}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed Jobs */}
                    {(completedOrders.length > 0 || completedTrips.length > 0) && (
                      <div>
                        <h3 className="text-xs md:text-sm font-black text-slate-900 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> Completed Jobs
                        </h3>
                        <div className="space-y-2">
                          {completedOrders.map((o) => (
                            <Link key={o.id} href={`/admin/orders`} className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors opacity-70">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-slate-600 truncate">Food Delivery - {o.id}</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase flex-shrink-0">Delivered</span>
                              </div>
                            </Link>
                          ))}
                          {completedTrips.map((t) => (
                            <Link key={t.id} href={`/admin/trips`} className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors opacity-70">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Navigation className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-slate-600 truncate">Pick & Drop - {t.id}</span>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase flex-shrink-0">Completed</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}