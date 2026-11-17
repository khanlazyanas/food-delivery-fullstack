"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  Download,
  XCircle,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { useBookingStore, Booking } from "@/store/bookingStore";
import toast from "react-hot-toast";

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const booking = useBookingStore((state) =>
    state.bookings.find((b) => b.id === id)
  );
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    useBookingStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const handleCopyId = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      toast.success("Booking ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTicket = () => {
    if (!booking) return;
    const ticket = `
========================================
       FOODIEHUB TABLE BOOKING
========================================
Booking ID: ${booking.id}
Status: ${booking.status.toUpperCase()}

---------- RESERVATION ----------
Date: ${new Date(booking.date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
Time: ${booking.time}
Guests: ${booking.guests}
Table: ${booking.tableNumber}

---------- CUSTOMER ----------
Name: ${booking.customer.name}
Phone: ${booking.customer.phone}
${booking.customer.email ? `Email: ${booking.customer.email}` : ""}
${booking.customer.specialRequests ? `Requests: ${booking.customer.specialRequests}` : ""}

---------- PAYMENT ----------
Estimated Bill: ₹${booking.estimatedBill}
Advance Paid (${booking.advancePercent}%): ₹${booking.advancePaid}
Payment Method: ${booking.paymentMethod.toUpperCase()}
Payment Status: ${booking.paymentStatus.toUpperCase()}

========================================
Show this at the restaurant entrance.
Thank you for booking with FoodieHub! 🍽️
    `.trim();

    const blob = new Blob([ticket], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FoodieHub-Booking-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Booking ticket downloaded!");
  };

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Booking not found
        </h1>
        <Link
          href="/table-booking"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Book a Table
        </Link>
      </div>
    );
  }

  const isCancelled = booking.status === "cancelled";
  const bookingDate = new Date(booking.date);

  const getStatusConfig = () => {
    switch (booking.status) {
      case "confirmed":
        return {
          label: "Confirmed",
          color: "text-green-600",
          bg: "bg-green-100",
          hero: "Booking Confirmed",
          icon: CheckCircle2,
          iconColor: "text-green-500",
          message:
            "Your table is reserved. We look forward to seeing you!",
        };
      case "pending":
        return {
          label: "Pending",
          color: "text-amber-600",
          bg: "bg-amber-100",
          hero: "Booking Pending",
          icon: Clock,
          iconColor: "text-amber-500",
          message:
            "Your booking is pending confirmation. We'll notify you shortly.",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "text-red-600",
          bg: "bg-red-100",
          hero: "Booking Cancelled",
          icon: XCircle,
          iconColor: "text-red-500",
          message:
            "This booking has been cancelled. Any advance paid will be refunded.",
        };
      case "completed":
        return {
          label: "Completed",
          color: "text-blue-600",
          bg: "bg-blue-100",
          hero: "Visit Completed",
          icon: CheckCircle2,
          iconColor: "text-blue-500",
          message: "Thank you for dining with us! Hope to see you again.",
        };
      default:
        return {
          label: "No-Show",
          color: "text-slate-600",
          bg: "bg-slate-100",
          hero: "No-Show",
          icon: AlertTriangle,
          iconColor: "text-slate-500",
          message:
            "This booking was marked as no-show. Contact support for help.",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

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
            {isCancelled ? (
              <>
                Booking
                <br />
                <span className="text-white">Cancelled</span>
              </>
            ) : (
              <>
                See you
                <br />
                <span className="text-white">soon! 🍽️</span>
              </>
            )}
          </h1>

          <p className="text-lg opacity-95 max-w-lg mx-auto">
            {statusConfig.message}
          </p>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-10 lg:py-14 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Booking ID Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Booking ID
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {booking.id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Copy booking ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Status
                </div>
                <span
                  className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Reservation Details
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Date
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {bookingDate.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  <div className="text-xs text-slate-500">
                    {bookingDate.getFullYear()}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Time
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {booking.time}
                  </div>
                  <div className="text-xs text-slate-500">Dinner/Lunch</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Guests
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {booking.guests}{" "}
                    {booking.guests === 1 ? "guest" : "guests"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Table
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {booking.tableNumber}
                  </div>
                </div>
              </div>
            </div>

            {booking.customer.specialRequests && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Special Requests
                    </div>
                    <div className="text-sm text-slate-700 italic">
                      &ldquo;{booking.customer.specialRequests}&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Contact Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                    Name
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {booking.customer.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                    Phone
                  </div>
                  <a
                    href={`tel:${booking.customer.phone}`}
                    className="text-sm font-semibold text-slate-900 hover:text-[#FF6B00]"
                  >
                    +91 {booking.customer.phone}
                  </a>
                </div>
              </div>

              {booking.customer.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                      Email
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {booking.customer.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Payment Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Estimated Bill</span>
                <span className="font-semibold text-slate-900">
                  ₹{booking.estimatedBill}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Advance ({booking.advancePercent}%)
                </span>
                <span className="font-bold text-[#FF6B00]">
                  ₹{booking.advancePaid}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {booking.paymentMethod === "online"
                    ? "Online"
                    : "At Restaurant"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Payment Status</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
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

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">
                  Remaining at Restaurant
                </span>
                <span className="font-black text-slate-900 text-xl">
                  ₹{booking.estimatedBill - booking.advancePaid}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Info */}
          {!isCancelled && (
            <div className="bg-blue-50 rounded-3xl p-5 border border-blue-200 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm mb-1">
                    Free Cancellation Available
                  </div>
                  <p className="text-xs text-blue-700 leading-snug">
                    You can cancel this booking free of charge up to 4 hours
                    before your reservation time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDownloadTicket}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border-2 border-slate-200 transition-all group"
            >
              <Download className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
              Download Booking Ticket
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/my-bookings"
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
              >
                My Bookings <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/menu"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border border-slate-200 transition-all"
              >
                Pre-Order Food
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}