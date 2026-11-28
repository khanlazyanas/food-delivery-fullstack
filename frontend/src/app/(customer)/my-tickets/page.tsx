"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Music,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Ticket as TicketIcon,
  Armchair,
  ArrowRight,
  Filter,
  Star,
} from "lucide-react";
import { useEventStore, Ticket } from "@/store/eventStore";

type Tab = "upcoming" | "past" | "cancelled";

export default function MyTicketsPage() {
  const tickets = useEventStore((state) => state.tickets);
  const fetchTickets = useEventStore((state) => state.fetchTickets); // 👈 Backend API
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  useEffect(() => {
    fetchTickets(); // 👈 Backend se data fetch karo
    setMounted(true);
  }, [fetchTickets]);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  // Check if event has passed
  const isPastEvent = (ticket: Ticket) => {
    const eventDateTime = new Date(
      `${ticket.eventDate}T${ticket.eventTime}`
    );
    return eventDateTime < new Date();
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "upcoming") {
      return !isPastEvent(t) && t.status !== "cancelled";
    }
    if (activeTab === "past") {
      return isPastEvent(t) && t.status !== "cancelled";
    }
    if (activeTab === "cancelled") {
      return t.status === "cancelled";
    }
    return true;
  });

  const counts = {
    upcoming: tickets.filter(
      (t) => !isPastEvent(t) && t.status !== "cancelled"
    ).length,
    past: tickets.filter((t) => isPastEvent(t) && t.status !== "cancelled")
      .length,
    cancelled: tickets.filter((t) => t.status === "cancelled").length,
  };

  const getStatusConfig = (status: Ticket["status"]) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: CheckCircle2,
        };
      case "checked-in":
        return {
          label: "Checked In",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
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
  if (tickets.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <TicketIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
          No tickets yet
        </h1>
        <p className="text-slate-500 mb-8">
          You haven&apos;t booked any event tickets yet. Explore our upcoming
          events!
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
        >
          Browse Events <ArrowRight className="w-4 h-4" />
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
                Your Events
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
                My Tickets
              </h1>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30"
            >
              <Music className="w-4 h-4" /> Browse Events
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
            {(
              [
                { key: "upcoming", label: "Upcoming", count: counts.upcoming },
                { key: "past", label: "Past", count: counts.past },
                {
                  key: "cancelled",
                  label: "Cancelled",
                  count: counts.cancelled,
                },
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

      {/* ================= TICKETS LIST ================= */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No {activeTab} tickets
              </h3>
              <p className="text-sm text-slate-500">
                {activeTab === "upcoming" &&
                  "You don't have any upcoming event tickets"}
                {activeTab === "past" &&
                  "Your past tickets will appear here"}
                {activeTab === "cancelled" &&
                  "You don't have any cancelled tickets"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const statusConfig = getStatusConfig(ticket.status);
                const StatusIcon = statusConfig.icon;
                const eventDate = new Date(ticket.eventDate);

                return (
                  <Link
                    key={ticket.id}
                    href={`/my-tickets/${ticket.id}`}
                    className="group block bg-white rounded-3xl border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden"
                  >
                    {/* Top Strip */}
                    <div
                      className={`flex items-center justify-between px-5 py-3 border-b ${statusConfig.bg} ${statusConfig.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon
                          className={`w-4 h-4 ${statusConfig.text}`}
                        />
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {ticket.id}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col sm:flex-row gap-0">
                      
                      {/* Banner Thumb */}
                      <div className="sm:w-48 h-40 sm:h-auto relative overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={ticket.eventBanner}
                          alt={ticket.eventName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r"></div>
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            Live
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-5 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Live Concert
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight line-clamp-1">
                              {ticket.eventName}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              feat. {ticket.eventArtist}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold">
                              {eventDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold">
                              {ticket.eventTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold truncate">
                              {ticket.eventVenue}
                            </span>
                          </div>
                        </div>

                        {/* Seats + Price */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <Armchair className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0" />
                            <div className="flex flex-wrap gap-1">
                              {ticket.chairNumbers.slice(0, 3).map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded"
                                >
                                  #{c}
                                </span>
                              ))}
                              {ticket.chairNumbers.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-500">
                                  +{ticket.chairNumbers.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Total
                            </div>
                            <div className="font-black text-[#FF6B00] text-lg">
                              ₹{ticket.totalPrice}
                            </div>
                          </div>
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