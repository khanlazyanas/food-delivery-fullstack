"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Filter,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { useBookingStore, Booking, BookingStatus } from "@/store/bookingStore";
import toast from "react-hot-toast";

type Tab = "upcoming" | "past" | "cancelled";

export default function MyBookingsPage() {
  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings); // 👈 Backend API
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [cancelConfirm, setCancelConfirm] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings(); // 👈 Backend se data fetch
    setMounted(true);
  }, [fetchBookings]);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  const isPast = (booking: Booking) => {
    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    return bookingDate < new Date();
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "upcoming") {
      return !isPast(b) && (b.status === "confirmed" || b.status === "pending");
    }
    if (activeTab === "past") {
      return b.status === "completed" || (isPast(b) && b.status === "confirmed");
    }
    if (activeTab === "cancelled") {
      return b.status === "cancelled" || b.status === "no-show";
    }
    return true;
  });

  const counts = {
    upcoming: bookings.filter(
      (b) => !isPast(b) && (b.status === "confirmed" || b.status === "pending")
    ).length,
    past: bookings.filter(
      (b) => b.status === "completed" || (isPast(b) && b.status === "confirmed")
    ).length,
    cancelled: bookings.filter(
      (b) => b.status === "cancelled" || b.status === "no-show"
    ).length,
  };

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case "confirmed": return { label: "Confirmed", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 };
      case "pending": return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock };
      case "cancelled": return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
      case "completed": return { label: "Completed", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2 };
      case "no-show": return { label: "No-Show", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: AlertTriangle };
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelConfirm) return;
    await cancelBooking(cancelConfirm.id, "Cancelled by customer"); // 👈 Await added
    toast.success("Booking cancelled");
    setCancelConfirm(null);
  };

  if (bookings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <CalendarDays className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">No bookings yet</h1>
        <p className="text-slate-500 mb-8">You haven&apos;t booked any tables yet. Reserve your table now!</p>
        <Link href="/table-booking" className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30">
          Book a Table <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">Manage Your Reservations</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">My Bookings</h1>
            </div>
            <Link href="/table-booking" className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30">
              <Calendar className="w-4 h-4" /> Book New
            </Link>
          </div>
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
            {([{ key: "upcoming", label: "Upcoming", count: counts.upcoming }, { key: "past", label: "Past", count: counts.past }, { key: "cancelled", label: "Cancelled", count: counts.cancelled }] as { key: Tab; label: string; count: number }[]).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab.key ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-white text-slate-600"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4"><Filter className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No {activeTab} bookings</h3>
              <p className="text-sm text-slate-500">
                {activeTab === "upcoming" && "You don't have any upcoming reservations"}
                {activeTab === "past" && "Your past bookings will appear here"}
                {activeTab === "cancelled" && "You don't have any cancelled bookings"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;
                const bookingDate = new Date(booking.date);
                const canCancel = booking.status === "confirmed" || booking.status === "pending";

                return (
                  <div key={booking.id} className="group bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden">
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${statusConfig.bg} ${statusConfig.border}`}>
                      <div className="flex items-center gap-2"><StatusIcon className={`w-4 h-4 ${statusConfig.text}`} /><span className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}>{statusConfig.label}</span></div>
                      <span className="text-xs font-semibold text-slate-500">Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <Link href={`/table-booking/${booking.id}`} className="block p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold uppercase tracking-widest text-slate-500">Booking ID</span><span className="font-black text-slate-900">{booking.id}</span></div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</div><div className="font-semibold text-slate-900 text-xs">{bookingDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div></div></div>
                            <div className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4 text-slate-400" /><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</div><div className="font-semibold text-slate-900 text-xs">{booking.time}</div></div></div>
                            <div className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4 text-slate-400" /><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guests</div><div className="font-semibold text-slate-900 text-xs">{booking.guests}</div></div></div>
                            <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-slate-400" /><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Table</div><div className="font-semibold text-slate-900 text-xs">{booking.tableNumber}</div></div></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-between">
                          <div className="sm:text-right"><div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Advance Paid</div><div className="text-2xl font-black text-[#FF6B00]">₹{booking.advancePaid}</div></div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                    {canCancel && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/table-booking/${booking.id}`} className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors">View Details</Link>
                          <button onClick={() => setCancelConfirm(booking)} className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl transition-colors"><XCircle className="w-3.5 h-3.5" /> Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setCancelConfirm(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-7 h-7" /></div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Cancel this booking?</h3>
            <p className="text-sm text-slate-500 text-center mb-2">Booking ID: <strong>{cancelConfirm.id}</strong></p>
            {cancelConfirm.paymentStatus === "paid" && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-snug">₹{cancelConfirm.advancePaid} advance will be refunded within 3-5 business days.</p>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors">Keep Booking</button>
              <button onClick={handleCancelBooking} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">Cancel Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}