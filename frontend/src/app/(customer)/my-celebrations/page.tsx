"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cake,
  Heart,
  Sparkles,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Filter,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import {
  useCelebrationStore,
  Celebration,
  CelebrationStatus,
} from "@/store/celebrationStore";

type Tab = "upcoming" | "past" | "cancelled";

export default function MyCelebrationsPage() {
  const bookings = useCelebrationStore((state) => state.bookings);
  const fetchBookings = useCelebrationStore((state) => state.fetchBookings); // 👈 Backend API
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

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

  const isPastEvent = (booking: Celebration) => {
    const eventDate = new Date(`${booking.date}T${booking.time}`);
    return eventDate < new Date() || booking.status === "completed";
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "upcoming") {
      return !isPastEvent(b) && b.status !== "cancelled";
    }
    if (activeTab === "past") {
      return isPastEvent(b) && b.status !== "cancelled";
    }
    if (activeTab === "cancelled") {
      return b.status === "cancelled";
    }
    return true;
  });

  const counts = {
    upcoming: bookings.filter((b) => !isPastEvent(b) && b.status !== "cancelled").length,
    past: bookings.filter((b) => isPastEvent(b) && b.status !== "cancelled").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const getOccasionIcon = (type: string) => {
    switch (type) {
      case "birthday": return <Cake className="w-5 h-5 text-pink-500" />;
      case "anniversary": return <Heart className="w-5 h-5 text-red-500" />;
      default: return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusConfig = (status: CelebrationStatus) => {
    switch (status) {
      case "confirmed": return { label: "Confirmed", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 };
      case "pending": return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock };
      case "completed": return { label: "Completed", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2 };
      case "cancelled": return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
      default: return { label: status, bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: Clock };
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <PartyPopper className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">No celebrations yet</h1>
        <p className="text-slate-500 mb-8">You haven&apos;t booked any celebrations yet. Let&apos;s plan something special!</p>
        <Link href="/celebrations" className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30">
          Book a Celebration <ArrowRight className="w-4 h-4" />
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
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">Your Special Moments</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">My Celebrations</h1>
            </div>
            <Link href="/celebrations" className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30">
              <PartyPopper className="w-4 h-4" /> Book New
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
              <h3 className="text-lg font-bold text-slate-900 mb-1">No {activeTab} celebrations</h3>
              <p className="text-sm text-slate-500">
                {activeTab === "upcoming" && "You don't have any upcoming celebrations planned"}
                {activeTab === "past" && "Your past celebrations will appear here"}
                {activeTab === "cancelled" && "You don't have any cancelled bookings"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;
                const eventDate = new Date(booking.date);

                return (
                  <Link key={booking.id} href={`/celebration-success/${booking.id}`} className="group block bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden">
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${statusConfig.bg} ${statusConfig.border}`}>
                      <div className="flex items-center gap-2">
                        {getOccasionIcon(booking.occasion)}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">{booking.occasion === "birthday" ? "Birthday" : booking.occasion === "anniversary" ? "Anniversary" : "Event"}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}>{statusConfig.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">{booking.id}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-900 mb-1 line-clamp-1">{booking.celebrantName}&apos;s {booking.packageName}</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                            <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="font-semibold">{eventDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                            <div className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="font-semibold">{booking.time}</span></div>
                            <div className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4 text-slate-400 flex-shrink-0" /><span className="font-semibold">{booking.guests} guests</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-between sm:pl-4 sm:border-l sm:border-slate-100">
                          <div className="sm:text-right">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Advance Paid</div>
                            <div className="text-2xl font-black text-[#FF6B00]">₹{booking.advancePaid}</div>
                            <div className="text-[10px] font-semibold text-slate-400">of ₹{booking.totalPrice} total</div>
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