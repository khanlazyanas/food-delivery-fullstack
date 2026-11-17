"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Music,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  CheckCircle2,
  XCircle,
  Search,
  User,
  Phone,
  Mail,
  Armchair,
  IndianRupee,
  BarChart3,
  X,
  AlertTriangle,
  QrCode,
  Check,
} from "lucide-react";
import { useEventStore, Ticket as TicketType } from "@/store/eventStore";
import toast from "react-hot-toast";

type Tab = "all" | "confirmed" | "checked-in" | "cancelled";

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const events = useEventStore((state) => state.events);
  const tickets = useEventStore((state) => state.tickets);
  const getBookedChairs = useEventStore((state) => state.getBookedChairs);
  const checkInTicket = useEventStore((state) => state.checkInTicket);
  const cancelTicket = useEventStore((state) => state.cancelTicket);

  const event = events.find((e) => e.id === id);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [checkInInput, setCheckInInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    useEventStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-slate-500">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Event not found
        </h2>
        <Link
          href="/admin/events"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-2.5 px-6 rounded-xl transition-all mt-4"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  // Filter tickets for this event
  const eventTickets = tickets.filter((t) => t.eventId === event.id);

  let filtered = eventTickets;
  if (activeTab === "confirmed") {
    filtered = filtered.filter((t) => t.status === "confirmed");
  } else if (activeTab === "checked-in") {
    filtered = filtered.filter((t) => t.status === "checked-in");
  } else if (activeTab === "cancelled") {
    filtered = filtered.filter((t) => t.status === "cancelled");
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.customer.name.toLowerCase().includes(q) ||
        t.customer.phone.includes(q)
    );
  }

  // Stats
  const bookedChairs = getBookedChairs(event.id);
  const available = event.totalChairs - bookedChairs.length;
  const soldPercent = Math.round(
    (bookedChairs.length / event.totalChairs) * 100
  );
  const totalRevenue = eventTickets
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.advancePaid, 0);
  const totalSeats = eventTickets
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.chairNumbers.length, 0);

  const counts = {
    all: eventTickets.length,
    confirmed: eventTickets.filter((t) => t.status === "confirmed").length,
    "checked-in": eventTickets.filter((t) => t.status === "checked-in")
      .length,
    cancelled: eventTickets.filter((t) => t.status === "cancelled").length,
  };

  const getStatusConfig = (status: TicketType["status"]) => {
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

  const handleCheckIn = (ticket: TicketType) => {
    if (ticket.status === "checked-in") {
      toast.error("Ticket already checked in");
      return;
    }
    if (ticket.status === "cancelled") {
      toast.error("Cannot check in a cancelled ticket");
      return;
    }
    checkInTicket(ticket.id);
    toast.success("Ticket checked in! ✅");
    if (selectedTicket) {
      setSelectedTicket({ ...ticket, status: "checked-in" });
    }
  };

  const handleCancelTicket = (ticket: TicketType) => {
    if (!confirm(`Cancel ticket ${ticket.id}?`)) return;
    cancelTicket(ticket.id);
    toast.success("Ticket cancelled");
    if (selectedTicket) {
      setSelectedTicket({ ...ticket, status: "cancelled" });
    }
  };

  // Manual check-in by ticket ID
  const handleManualCheckIn = () => {
    const trimmed = checkInInput.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Enter a ticket ID");
      return;
    }
    const ticket = eventTickets.find(
      (t) => t.id.toUpperCase() === trimmed
    );
    if (!ticket) {
      toast.error("Ticket not found for this event");
      return;
    }
    handleCheckIn(ticket);
    setCheckInInput("");
    setShowScanner(false);
  };

  return (
    <div>
      {/* Back button */}
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      {/* ============ EVENT HEADER ============ */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-6">
        <div className="relative h-48 lg:h-56">
          <img
            src={event.banner}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Live Concert
              </span>
              {event.isActive ? (
                <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  <Check className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-slate-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {event.name}
            </h1>
            <p className="text-sm text-white/80 mt-1">
              feat. {event.artist}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6B00]" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Date
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6B00]" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Time
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {event.time}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <MapPin className="w-4 h-4 text-[#FF6B00]" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Venue
                </div>
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {event.venue}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STATS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Seats Booked
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {bookedChairs.length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            of {event.totalChairs} ({soldPercent}%)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Tickets Sold
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {counts.all}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {counts["checked-in"]} checked in
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Advance Collected
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {totalSeats} seats total
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Available
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {available}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">seats left</div>
        </div>
      </div>

      {/* ============ CHECK-IN BAR ============ */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] rounded-2xl p-5 mb-6 text-white shadow-lg shadow-orange-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight">
                Quick Check-In
              </div>
              <div className="text-xs opacity-90">
                Enter ticket ID to check-in guests
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="TKT12345678"
              value={checkInInput}
              onChange={(e) => setCheckInInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleManualCheckIn()}
              className="flex-1 md:w-56 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/30 focus:bg-white/30 focus:border-white outline-none transition-all font-mono uppercase tracking-wider text-sm"
            />
            <button
              onClick={handleManualCheckIn}
              className="flex items-center gap-2 bg-white text-[#FF6B00] hover:bg-slate-100 font-bold px-5 py-3 rounded-xl transition-all shadow-lg whitespace-nowrap"
            >
              <Check className="w-4 h-4" /> Check In
            </button>
          </div>
        </div>
      </div>

      {/* ============ TABS ============ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(
          [
            { key: "all", label: "All", count: counts.all },
            { key: "confirmed", label: "Confirmed", count: counts.confirmed },
            {
              key: "checked-in",
              label: "Checked In",
              count: counts["checked-in"],
            },
            { key: "cancelled", label: "Cancelled", count: counts.cancelled },
          ] as { key: Tab; label: string; count: number }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
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
      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket ID, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* ============ TICKETS LIST ============ */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const config = getStatusConfig(ticket.status);
            const StatusIcon = config.icon;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${config.bg} ${config.text}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                        <span className="font-mono font-black text-slate-900">
                          {ticket.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(ticket.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">
                            {ticket.customer.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{ticket.customer.phone}</span>
                        </div>
                      </div>

                      {/* Seats */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Armchair className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Seats:
                        </span>
                        {ticket.chairNumbers.map((c) => (
                          <span
                            key={c}
                            className="text-xs font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded"
                          >
                            #{c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-between gap-3 lg:min-w-[180px]">
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                          Advance
                        </div>
                        <div className="text-2xl font-black text-[#FF6B00]">
                          ₹{ticket.advancePaid}
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ticket.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : ticket.paymentStatus === "refunded"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ticket.paymentStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ticket.status === "confirmed" && (
                          <button
                            onClick={() => handleCheckIn(ticket)}
                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-lg shadow-green-500/30 whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Check In
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                          aria-label="View details"
                        >
                          <BarChart3 className="w-4 h-4" />
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

      {/* ============ TICKET DETAIL MODAL ============ */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  Ticket Details
                </span>
                <h2 className="font-mono text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {selectedTicket.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  {(() => {
                    const c = getStatusConfig(selectedTicket.status);
                    const I = c.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${c.bg} ${c.text}`}
                      >
                        <I className="w-3.5 h-3.5" />
                        {c.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-slate-500">
                    Advance
                  </div>
                  <div className="text-2xl font-black text-[#FF6B00]">
                    ₹{selectedTicket.advancePaid}
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
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {selectedTicket.customer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a
                      href={`tel:${selectedTicket.customer.phone}`}
                      className="text-slate-700 hover:text-[#FF6B00]"
                    >
                      +91 {selectedTicket.customer.phone}
                    </a>
                  </div>
                  {selectedTicket.customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {selectedTicket.customer.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seats */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Seats ({selectedTicket.chairNumbers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.chairNumbers.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 bg-[#FF6B00] text-white text-sm font-black px-3 py-1.5 rounded-lg"
                    >
                      <Armchair className="w-3.5 h-3.5" /> #{c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Ticket Price</span>
                  <span>₹{selectedTicket.ticketPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total</span>
                  <span>₹{selectedTicket.totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Advance ({selectedTicket.advancePercent}%)</span>
                  <span className="font-bold text-[#FF6B00]">
                    ₹{selectedTicket.advancePaid}
                  </span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>Payable at Venue</span>
                  <span>
                    ₹{selectedTicket.totalPrice - selectedTicket.advancePaid}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {selectedTicket.status === "confirmed" && (
                  <button
                    onClick={() => handleCheckIn(selectedTicket)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Check In
                  </button>
                )}
                {selectedTicket.status !== "cancelled" && (
                  <button
                    onClick={() => handleCancelTicket(selectedTicket)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel Ticket
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