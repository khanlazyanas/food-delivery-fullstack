"use client";

import { useEffect, useState } from "react";
import {
  Search,
  PartyPopper,
  Cake,
  Heart,
  Sparkles,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  XCircle,
  CheckCircle2,
  X,
  Phone,
  User,
  IndianRupee,
  Filter,
  ChefHat,
  Gift,
} from "lucide-react";
import {
  useCelebrationStore,
  Celebration,
  CelebrationStatus,
  PreparationStatus,
  CardStatus,
} from "@/store/celebrationStore";
import toast from "react-hot-toast";

type Tab = "all" | "confirmed" | "completed" | "cancelled";

export default function AdminCelebrationsPage() {
  const bookings = useCelebrationStore((state) => state.bookings);
  const packages = useCelebrationStore((state) => state.packages);
  const updateBookingStatus = useCelebrationStore((state) => state.updateBookingStatus);
  const updatePreparationStatus = useCelebrationStore((state) => state.updatePreparationStatus);
  const updateCardStatus = useCelebrationStore((state) => state.updateCardStatus);
  const cancelBooking = useCelebrationStore((state) => state.cancelBooking);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Celebration | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Celebration | null>(null);

  useEffect(() => {
    useCelebrationStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-slate-500 p-4">Loading bookings...</div>;

  let filtered = bookings;
  if (activeTab !== "all") filtered = filtered.filter((b) => b.status === activeTab);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.customer.name.toLowerCase().includes(q) ||
        b.customer.phone.includes(q) ||
        b.celebrantName.toLowerCase().includes(q)
    );
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue: bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };

  const getOccasionIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <Cake className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-500" />;
      case "anniversary":
        return <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />;
    }
  };

  const getStatusConfig = (status: CelebrationStatus) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmed", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 };
      case "pending":
        return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock };
      case "completed":
        return { label: "Completed", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2 };
      case "cancelled":
        return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
    }
  };

  const handleMarkCompleted = (booking: Celebration) => {
    updateBookingStatus(booking.id, "completed");
    toast.success("Marked as completed");
    if (selectedBooking) setSelectedBooking({ ...booking, status: "completed" });
  };

  const handleCancel = () => {
    if (!confirmCancel) return;
    cancelBooking(confirmCancel.id);
    toast.success("Booking cancelled");
    setConfirmCancel(null);
    setSelectedBooking(null);
  };

  const selectedPkg = selectedBooking
    ? packages.find((p) => p.id === selectedBooking.packageId)
    : null;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
          Celebration Management
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
          Celebrations & Events
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">
          Manage birthdays, anniversaries and special occasions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={PartyPopper} label="Total Bookings" value={stats.total} color="orange" />
        <StatCard icon={CheckCircle2} label="Active" value={stats.confirmed} color="green" />
        <StatCard icon={Sparkles} label="Packages" value={packages.filter((p) => p.isActive).length} color="blue" />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {(
          [
            { key: "all", label: "All Bookings", count: stats.total },
            { key: "confirmed", label: "Confirmed", count: stats.confirmed },
            { key: "completed", label: "Completed", count: stats.completed },
            { key: "cancelled", label: "Cancelled", count: bookings.filter((b) => b.status === "cancelled").length },
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
            <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking ID, customer, celebrant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((booking) => {
            const config = getStatusConfig(booking.status);
            const StatusIcon = config.icon;
            const eventDate = new Date(booking.date);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-3 md:p-5">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    
                    {/* Left Side */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${config.bg} ${config.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <span className="font-mono font-black text-slate-900 text-sm md:text-base">{booking.id}</span>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                          {getOccasionIcon(booking.occasion)}
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                            {booking.occasion}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 mb-1">
                        {booking.celebrantPhoto && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-orange-200 flex-shrink-0">
                            <img
                              src={booking.celebrantPhoto}
                              alt={booking.celebrantName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-black text-slate-900 text-base md:text-lg truncate">
                          {booking.celebrantName}&apos;s {booking.packageName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 text-sm mt-3">
                        <Info icon={Calendar} text={eventDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
                        <Info icon={Clock} text={booking.time} />
                        <Info icon={Users} text={`${booking.guests} pax`} />
                        <Info icon={User} text={booking.customer.name} bold />
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 lg:min-w-[180px] mt-2 pt-3 lg:mt-0 lg:pt-0 border-t border-slate-100 lg:border-0">
                      <div className="flex items-center justify-between w-full lg:w-full">
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Total</div>
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-black text-[#FF6B00]">₹{booking.totalPrice}</div>
                          <div className="text-[9px] md:text-[10px] font-bold text-green-600 mt-0.5">₹{booking.advancePaid} Paid</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full lg:w-full">
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => handleMarkCompleted(booking)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 md:p-2.5 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0"
                          aria-label="View details"
                        >
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

      {/* ============ DETAIL MODAL ============ */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">Booking Details</span>
                <h2 className="font-mono text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedBooking.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
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
                    const c = getStatusConfig(selectedBooking.status);
                    const I = c.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${c.bg} ${c.text}`}>
                        <I className="w-3.5 h-3.5" />
                        {c.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-[10px] md:text-xs font-bold uppercase text-slate-500">Total</div>
                  <div className="text-xl md:text-2xl font-black text-[#FF6B00]">₹{selectedBooking.totalPrice}</div>
                </div>
              </div>

              {/* WISHING CARD PREVIEW */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Wishing Card
                </h3>
                <div className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] rounded-2xl p-4 md:p-6 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3D1C00]/40 rounded-full blur-3xl"></div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-3 bg-white/20 flex items-center justify-center">
                      {selectedBooking.celebrantPhoto ? (
                        <img
                          src={selectedBooking.celebrantPhoto}
                          alt={selectedBooking.celebrantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 md:w-10 md:h-10 text-white/70" />
                      )}
                    </div>

                    <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 mb-1">
                      {selectedBooking.occasion === "birthday"
                        ? "Happy Birthday"
                        : selectedBooking.occasion === "anniversary"
                        ? "Happy Anniversary"
                        : "Congratulations"}
                    </div>

                    <h4 className="text-xl md:text-2xl font-black tracking-tight mb-3">
                      {selectedBooking.celebrantName}
                    </h4>

                    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 w-full">
                      <p className="text-xs md:text-sm italic leading-relaxed">
                        &ldquo;{selectedBooking.specialMessage || "—"}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <span className={`flex-1 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg ${getCardBadge(selectedBooking.cardStatus)}`}>
                    Card: {selectedBooking.cardStatus}
                  </span>
                  <span className={`flex-1 text-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg ${getPrepBadge(selectedBooking.preparationStatus)}`}>
                    Prep: {selectedBooking.preparationStatus}
                  </span>
                </div>
              </div>

              {/* Manage Status */}
              <div className="p-3 md:p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-800 mb-3 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" /> Manage Event Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Preparation</label>
                    <select
                      value={selectedBooking.preparationStatus}
                      onChange={(e) => {
                        updatePreparationStatus(selectedBooking.id, e.target.value as PreparationStatus);
                        setSelectedBooking({ ...selectedBooking, preparationStatus: e.target.value as PreparationStatus });
                        toast.success("Preparation status updated");
                      }}
                      className="w-full px-3 py-2 rounded-lg text-sm text-slate-900 bg-white border border-slate-200 focus:border-[#FF6B00] outline-none cursor-pointer capitalize font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="decorating">Decorating</option>
                      <option value="preparing">Preparing Food</option>
                      <option value="ready">Ready</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Wishing Card</label>
                    <select
                      value={selectedBooking.cardStatus}
                      onChange={(e) => {
                        updateCardStatus(selectedBooking.id, e.target.value as CardStatus);
                        setSelectedBooking({ ...selectedBooking, cardStatus: e.target.value as CardStatus });
                        toast.success("Card status updated");
                      }}
                      className="w-full px-3 py-2 rounded-lg text-sm text-slate-900 bg-white border border-slate-200 focus:border-[#FF6B00] outline-none cursor-pointer capitalize font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="designing">Designing</option>
                      <option value="printed">Printed</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Package</h3>
                <div className="p-3 md:p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div>
                      <div className="font-black text-slate-900 text-sm md:text-base">{selectedBooking.packageName}</div>
                      {selectedPkg && (
                        <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{selectedPkg.description}</div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base md:text-lg font-black text-[#FF6B00]">₹{selectedBooking.totalPrice}</div>
                    </div>
                  </div>
                  {selectedPkg && selectedPkg.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200">
                      {selectedPkg.features.map((f) => (
                        <span key={f} className="text-[9px] md:text-[10px] font-semibold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Event Info</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
                  <Field label="Celebrant" value={selectedBooking.celebrantName} />
                  <Field
                    label="Date & Time"
                    value={`${new Date(selectedBooking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${selectedBooking.time}`}
                  />
                  <Field label="Guests" value={`${selectedBooking.guests} people`} />
                  <Field label="Payment" value={`₹${selectedBooking.advancePaid} adv (${selectedBooking.paymentMethod.toUpperCase()})`} />
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Customer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{selectedBooking.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${selectedBooking.customer.phone}`} className="text-slate-700 hover:text-[#FF6B00]">
                      +91 {selectedBooking.customer.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Special Requests</h3>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs md:text-sm text-slate-800 italic">&ldquo;{selectedBooking.specialRequests}&rdquo;</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {selectedBooking.status === "confirmed" && (
                  <button
                    onClick={() => handleMarkCompleted(selectedBooking)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Completed
                  </button>
                )}
                {selectedBooking.status !== "cancelled" && selectedBooking.status !== "completed" && (
                  <button
                    onClick={() => {
                      setConfirmCancel(selectedBooking);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmCancel(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 md:p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Cancel this booking?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Booking ID: <strong>{confirmCancel.id}</strong>
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== HELPERS ==========
function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: "orange" | "green" | "blue" | "purple" }) {
  const c = {
    orange: "bg-orange-100 text-[#FF6B00]",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  }[color];
  return (
    <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100">
      <div className="flex items-center gap-2 mb-1.5 md:mb-2">
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c}`}>
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">{label}</span>
      </div>
      <div className="text-lg md:text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function Info({ icon: Icon, text, bold }: { icon: React.ComponentType<{ className?: string }>; text: string; bold?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 min-w-0">
      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
      <span className={`text-[10px] md:text-sm truncate ${bold ? "font-semibold text-slate-900" : ""}`}>{text}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold mb-0.5">{label}</div>
      <div className="font-semibold text-slate-900 text-xs md:text-sm truncate">{value}</div>
    </div>
  );
}

function getPrepBadge(s: PreparationStatus) {
  switch (s) {
    case "pending": return "bg-slate-100 text-slate-700";
    case "decorating": return "bg-yellow-100 text-yellow-700";
    case "preparing": return "bg-blue-100 text-blue-700";
    case "ready": return "bg-green-100 text-green-700";
  }
}

function getCardBadge(s: CardStatus) {
  switch (s) {
    case "pending": return "bg-slate-100 text-slate-700";
    case "designing": return "bg-purple-100 text-purple-700";
    case "printed": return "bg-indigo-100 text-indigo-700";
    case "delivered": return "bg-green-100 text-green-700";
  }
}