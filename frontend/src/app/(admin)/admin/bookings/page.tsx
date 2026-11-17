"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  XCircle,
  CheckCircle2,
  X,
  Phone,
  Mail,
  User,
  MessageSquare,
  AlertTriangle,
  Filter,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import {
  useBookingStore,
  Booking,
  BookingStatus,
} from "@/store/bookingStore";
import toast from "react-hot-toast";

type Tab = "all" | "upcoming" | "completed" | "cancelled";

export default function AdminBookingsPage() {
  const bookings = useBookingStore((state) => state.bookings);
  const updateBookingStatus = useBookingStore((state) => state.updateBookingStatus);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  // @ts-ignore
  const updateBookingDateTime = useBookingStore((state) => state.updateBookingDateTime);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    useBookingStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading bookings...</div>;
  }

  const isPast = (b: Booking) => {
    const bookingDate = new Date(`${b.date}T${b.time}`);
    return bookingDate < new Date();
  };

  let filtered = bookings;
  if (activeTab === "upcoming") {
    filtered = filtered.filter(
      (b) => !isPast(b) && (b.status === "confirmed" || b.status === "pending")
    );
  } else if (activeTab === "completed") {
    filtered = filtered.filter(
      (b) => b.status === "completed" || (isPast(b) && b.status === "confirmed")
    );
  } else if (activeTab === "cancelled") {
    filtered = filtered.filter(
      (b) => b.status === "cancelled" || b.status === "no-show"
    );
  }

  if (dateFilter) {
    filtered = filtered.filter((b) => b.date === dateFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.customer.name.toLowerCase().includes(q) ||
        b.customer.phone.includes(q) ||
        b.tableNumber.toLowerCase().includes(q)
    );
  }

  const counts = {
    all: bookings.length,
    upcoming: bookings.filter(
      (b) => !isPast(b) && (b.status === "confirmed" || b.status === "pending")
    ).length,
    completed: bookings.filter(
      (b) => b.status === "completed" || (isPast(b) && b.status === "confirmed")
    ).length,
    cancelled: bookings.filter(
      (b) => b.status === "cancelled" || b.status === "no-show"
    ).length,
  };

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmed", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 };
      case "pending":
        return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock };
      case "cancelled":
        return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
      case "completed":
        return { label: "Completed", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2 };
      case "no-show":
        return { label: "No-Show", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: AlertTriangle };
    }
  };

  const handleMarkCompleted = (booking: Booking) => {
    updateBookingStatus(booking.id, "completed");
    toast.success("Marked as completed");
    if (selectedBooking) setSelectedBooking({ ...booking, status: "completed" });
  };

  const handleMarkNoShow = (booking: Booking) => {
    if (!confirm(`Mark booking ${booking.id} as no-show?`)) return;
    updateBookingStatus(booking.id, "no-show");
    toast.success("Marked as no-show");
    if (selectedBooking) setSelectedBooking({ ...booking, status: "no-show" });
  };

  const handleCancel = (booking: Booking) => {
    if (!confirm(`Cancel booking ${booking.id}?`)) return;
    cancelBooking(booking.id, "Cancelled by admin");
    toast.success("Booking cancelled");
    if (selectedBooking) setSelectedBooking({ ...booking, status: "cancelled" });
  };

  const openReschedule = (booking: Booking) => {
    setRescheduleBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking) return;
    if (!newDate || !newTime) {
      toast.error("Please select both date and time");
      return;
    }

    updateBookingDateTime(rescheduleBooking.id, newDate, newTime);
    toast.success("Booking rescheduled successfully!");
    setRescheduleBooking(null);
    if (selectedBooking) {
      setSelectedBooking({ ...selectedBooking, date: newDate, time: newTime });
    }
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
          Booking Management
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
          Table Bookings
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">
          {bookings.length} total · {counts.upcoming} upcoming
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {(
          [
            { key: "all", label: "All", count: counts.all },
            { key: "upcoming", label: "Upcoming", count: counts.upcoming },
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking ID, name, table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <CalendarDays className="w-4 h-4 text-slate-400 hidden sm:block" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:border-orange-500 outline-none cursor-pointer"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((booking) => {
            const config = getStatusConfig(booking.status);
            const StatusIcon = config.icon;
            const bookingDate = new Date(booking.date);
            const canComplete = booking.status === "confirmed" && !isPast(booking);
            const canCancel = booking.status === "confirmed" || booking.status === "pending";
            const canReschedule = booking.status === "confirmed" || booking.status === "pending";

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 md:px-3 py-1 md:py-1.5 rounded-full ${config.bg} ${config.text}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <span className="font-black text-slate-900 text-sm md:text-base">
                          {booking.id}
                        </span>
                        <span className="text-[10px] md:text-xs text-slate-500">
                          Booked{" "}
                          {new Date(booking.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Booking slots */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 text-sm mb-3">
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 text-[11px] md:text-xs truncate">
                            {bookingDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600">
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 text-[11px] md:text-xs">
                            {booking.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 text-[11px] md:text-xs">
                            {booking.guests} guests
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 text-[11px] md:text-xs">
                            {booking.tableNumber}
                          </span>
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">
                            {booking.customer.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{booking.customer.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 lg:min-w-[200px] mt-2 pt-3 lg:mt-0 lg:pt-0 border-t border-slate-100 lg:border-0">
                      
                      <div className="flex items-center justify-between w-full lg:w-full">
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                          Advance
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xl md:text-2xl font-black text-[#FF6B00]">
                            ₹{booking.advancePaid}
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              booking.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : booking.paymentStatus === "refunded"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full lg:w-full">
                        {canReschedule && (
                          <button
                            onClick={() => openReschedule(booking)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all whitespace-nowrap"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reschedule
                          </button>
                        )}
                        {canComplete && (
                          <button
                            onClick={() => handleMarkCompleted(booking)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap"
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

      {/* ============ BOOKING DETAIL MODAL ============ */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-5 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  Booking Details
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedBooking.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  {(() => {
                    const c = getStatusConfig(selectedBooking.status);
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
                    Advance
                  </div>
                  <div className="text-xl md:text-2xl font-black text-[#FF6B00]">
                    ₹{selectedBooking.advancePaid}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Reservation
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Date</div>
                    <div className="font-semibold text-slate-900 text-xs md:text-sm">
                      {new Date(selectedBooking.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Time</div>
                    <div className="font-semibold text-slate-900 text-xs md:text-sm">{selectedBooking.time}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Guests</div>
                    <div className="font-semibold text-slate-900 text-xs md:text-sm">{selectedBooking.guests}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Table</div>
                    <div className="font-semibold text-slate-900 text-xs md:text-sm">{selectedBooking.tableNumber}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Customer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-900">{selectedBooking.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${selectedBooking.customer.phone}`} className="text-slate-700 hover:text-[#FF6B00]">
                      +91 {selectedBooking.customer.phone}
                    </a>
                  </div>
                  {selectedBooking.customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-700 truncate">{selectedBooking.customer.email}</span>
                    </div>
                  )}
                  {selectedBooking.customer.specialRequests && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 italic">&ldquo;{selectedBooking.customer.specialRequests}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Bill</span>
                  <span>₹{selectedBooking.estimatedBill}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Advance ({selectedBooking.advancePercent}%)</span>
                  <span className="font-bold text-[#FF6B00]">₹{selectedBooking.advancePaid}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Method</span>
                  <span className="capitalize">{selectedBooking.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-100 text-base">
                  <span>Payable at Restaurant</span>
                  <span>₹{selectedBooking.estimatedBill - selectedBooking.advancePaid}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                {(selectedBooking.status === "confirmed" || selectedBooking.status === "pending") && (
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      openReschedule(selectedBooking);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <RefreshCw className="w-4 h-4" /> Reschedule
                  </button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <button
                    onClick={() => handleMarkCompleted(selectedBooking)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                )}
                {(selectedBooking.status === "confirmed" || selectedBooking.status === "pending") && (
                  <>
                    <button
                      onClick={() => handleMarkNoShow(selectedBooking)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
                    >
                      No-Show
                    </button>
                    <button
                      onClick={() => handleCancel(selectedBooking)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ RESCHEDULE MODAL ============ */}
      {rescheduleBooking && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setRescheduleBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#FF6B00]" /> Reschedule
              </h3>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}