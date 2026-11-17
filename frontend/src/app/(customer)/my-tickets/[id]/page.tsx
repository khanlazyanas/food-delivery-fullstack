"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Copy,
  Check,
  ArrowRight,
  Download,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Music,
  Armchair,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEventStore } from "@/store/eventStore";
import toast from "react-hot-toast";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ticket = useEventStore((state) =>
    state.tickets.find((t) => t.id === id)
  );
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    useEventStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const handleCopyId = () => {
    if (ticket) {
      navigator.clipboard.writeText(ticket.id);
      setCopied(true);
      toast.success("Ticket ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!ticket) return;

    const ticketText = `
========================================
       FOODIEHUB EVENT TICKET
========================================
Ticket ID: ${ticket.id}

---------- EVENT ----------
${ticket.eventName}
feat. ${ticket.eventArtist}

Date: ${new Date(ticket.eventDate).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
Time: ${ticket.eventTime}
Venue: ${ticket.eventVenue}

---------- YOUR SEATS ----------
Chair Numbers: ${ticket.chairNumbers.map((c) => "#" + c).join(", ")}
Total Seats: ${ticket.chairNumbers.length}

---------- CUSTOMER ----------
Name: ${ticket.customer.name}
Phone: ${ticket.customer.phone}
${ticket.customer.email ? `Email: ${ticket.customer.email}` : ""}

---------- PAYMENT ----------
Ticket Price: ₹${ticket.ticketPrice}
Total: ₹${ticket.totalPrice}
Advance Paid (${ticket.advancePercent}%): ₹${ticket.advancePaid}
Pay at Venue: ₹${ticket.totalPrice - ticket.advancePaid}

---------- STATUS ----------
${ticket.status.toUpperCase()}

========================================
Show this ticket at the entrance.
QR Code contains: ${ticket.id}
========================================

Thank you! Enjoy the show! 🎵
    `.trim();

    const blob = new Blob([ticketText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FoodieHub-Ticket-${ticket.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Ticket downloaded!");
  };

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Ticket not found
        </h1>
        <Link
          href="/events"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  const isCancelled = ticket.status === "cancelled";
  const isCheckedIn = ticket.status === "checked-in";
  const eventDate = new Date(ticket.eventDate);

  const getStatusConfig = () => {
    if (isCancelled) {
      return {
        label: "Cancelled",
        hero: "Ticket Cancelled",
        icon: XCircle,
        iconColor: "text-red-500",
        message: "This ticket has been cancelled. Refund will be processed.",
      };
    }
    if (isCheckedIn) {
      return {
        label: "Checked In",
        hero: "Welcome!",
        icon: CheckCircle2,
        iconColor: "text-blue-500",
        message: "You've been checked in. Enjoy the show!",
      };
    }
    return {
      label: "Confirmed",
      hero: "Ticket Confirmed",
      icon: CheckCircle2,
      iconColor: "text-green-500",
      message: "Your seat is reserved. See you at the event!",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // QR Code data
  const qrData = JSON.stringify({
    t: ticket.id,
    e: ticket.eventId,
    c: ticket.chairNumbers,
    n: ticket.customer.name,
    p: ticket.customer.phone,
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <StatusIcon className={`w-12 h-12 ${statusConfig.iconColor}`} />
          </div>

          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase opacity-90 mb-3">
            {statusConfig.hero}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
            {ticket.eventName}
          </h1>

          <p className="text-lg opacity-95 max-w-lg mx-auto mb-2">
            feat. <strong>{ticket.eventArtist}</strong>
          </p>
          <p className="text-sm opacity-80">{statusConfig.message}</p>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-10 lg:py-14 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* THE TICKET */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-2xl mb-6">
            
            {/* Ticket Header */}
            <div className="bg-[#3D1C00] text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/30 rounded-full blur-[80px]"></div>
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF6B00] mb-1">
                    E-Ticket
                  </div>
                  <div className="text-2xl font-black">FoodieHub</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
                    Ticket ID
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">{ticket.id}</span>
                    <button
                      onClick={handleCopyId}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      aria-label="Copy ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/60" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated divider */}
            <div className="relative h-6 bg-white">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-100"></div>
              <div className="absolute -right-3 top-0 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-100"></div>
              <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-slate-200"></div>
            </div>

            {/* QR Code Section */}
            <div className="px-6 sm:px-10 py-8 flex flex-col items-center">
              <div className="relative">
                <div className="p-4 bg-white rounded-2xl border-4 border-[#FF6B00] shadow-xl">
                  <QRCodeSVG
                    value={qrData}
                    size={200}
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#0F172A"
                  />
                </div>
                {isCancelled && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-red-600 font-black text-2xl rotate-[-20deg] border-4 border-red-600 px-4 py-2 rounded-lg">
                      CANCELLED
                    </span>
                  </div>
                )}
                {isCheckedIn && (
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <Check className="w-6 h-6" />
                  </div>
                )}
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-4 mb-1">
                Scan at Entrance
              </p>
              <p className="text-[11px] text-slate-400 text-center max-w-xs">
                Show this QR code at the venue for entry verification
              </p>
            </div>

            {/* Divider */}
            <div className="relative h-6 bg-white">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-100"></div>
              <div className="absolute -right-3 top-0 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-100"></div>
              <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-slate-200"></div>
            </div>

            {/* Event Info */}
            <div className="px-6 sm:px-10 py-8">
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Date</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm font-bold text-slate-900">
                      {eventDate.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Time</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm font-bold text-slate-900">{ticket.eventTime}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Venue</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm font-bold text-slate-900">{ticket.eventVenue}</span>
                  </div>
                </div>
              </div>

              {/* Seats */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700 mb-1">Your Seats</div>
                    <div className="text-sm font-black text-slate-900">
                      {ticket.chairNumbers.length} seat{ticket.chairNumbers.length > 1 ? "s" : ""} reserved
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.chairNumbers.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 bg-[#FF6B00] text-white text-xs font-black px-2.5 py-1 rounded-full">
                        <Armchair className="w-3 h-3" /> #{c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOMER + PAYMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Customer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Attendee</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{ticket.customer.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a href={`tel:${ticket.customer.phone}`} className="text-sm font-semibold text-slate-900 hover:text-[#FF6B00]">
                    +91 {ticket.customer.phone}
                  </a>
                </div>
                {ticket.customer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 truncate">{ticket.customer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Ticket Price</span>
                  <span className="font-semibold text-slate-900">₹{ticket.ticketPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total</span>
                  <span className="font-semibold text-slate-900">₹{ticket.totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Advance Paid</span>
                  <span className="font-bold text-[#FF6B00]">₹{ticket.advancePaid}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-xs">Pay at Venue</span>
                  <span className="font-black text-slate-900">₹{ticket.totalPrice - ticket.advancePaid}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  ticket.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : ticket.paymentStatus === "refunded"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  Advance {ticket.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          {!isCancelled && !isCheckedIn && (
            <div className="bg-blue-50 rounded-3xl p-5 border border-blue-200 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm mb-1">Important</div>
                  <p className="text-xs text-blue-700 leading-snug">
                    Bring a valid ID for verification. Ticket is non-transferable. Entry allowed 30 minutes before show time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border-2 border-slate-200 transition-all group"
            >
              <Download className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
              Download Ticket
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/my-tickets"
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
              >
                My Tickets <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/events"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border border-slate-200 transition-all"
              >
                <Music className="w-4 h-4" />
                More Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}