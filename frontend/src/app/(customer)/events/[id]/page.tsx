"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Music,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Check,
  User,
  Phone,
  Mail,
  MessageSquare,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  AlertTriangle,
  Info,
  Star,
  Armchair,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const events = useEventStore((state) => state.events);
  const getBookedChairs = useEventStore((state) => state.getBookedChairs);
  const addTicket = useEventStore((state) => state.addTicket);
  const settings = useSettingsStore((state) => state.settings);
  const user = useAuthStore((state) => state.user);

  const event = events.find((e) => e.id === id);

  const [mounted, setMounted] = useState(false);
  const [selectedChairs, setSelectedChairs] = useState<number[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    useEventStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name);
      setCustomerPhone((prev) => prev || user.phone);
      setCustomerEmail((prev) => prev || user.email || "");
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Music className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Event not found
        </h1>
        <Link
          href="/events"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  if (!event.isActive) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Event Unavailable
        </h1>
        <p className="text-slate-500 mb-6">
          This event is no longer accepting bookings.
        </p>
        <Link
          href="/events"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          View Other Events
        </Link>
      </div>
    );
  }

  const bookedChairs = getBookedChairs(event.id);
  const eventDate = new Date(event.date);

  // Compute pricing
  const totalPrice = selectedChairs.length * event.ticketPrice;
  const advancePercent = settings.advancePaymentPercent || 50;
  const advanceAmount = Math.round((totalPrice * advancePercent) / 100);
  const remainingAmount = totalPrice - advanceAmount;

  const toggleChair = (chairNumber: number) => {
    if (bookedChairs.includes(chairNumber)) return;
    setSelectedChairs((prev) =>
      prev.includes(chairNumber)
        ? prev.filter((c) => c !== chairNumber)
        : [...prev, chairNumber]
    );
  };

  const handleConfirm = async () => {
    if (selectedChairs.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please fill your name and phone");
      return;
    }
    if (customerPhone.length !== 10) {
      toast.error("Enter valid 10-digit phone");
      return;
    }

    setIsProcessing(true);
    if (paymentMethod === "online") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const ticket = addTicket({
      eventId: event.id,
      eventName: event.name,
      eventBanner: event.banner,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      eventArtist: event.artist,
      chairNumbers: selectedChairs.sort((a, b) => a - b),
      customer: {
        name: customerName.trim(),
        phone: customerPhone,
        email: customerEmail.trim() || undefined,
      },
      ticketPrice: event.ticketPrice,
      totalPrice,
      advancePaid: advanceAmount,
      advancePercent,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      status: "confirmed",
    });

    setIsProcessing(false);
    toast.success("Ticket booked successfully! 🎉");
    router.push(`/my-tickets/${ticket.id}`);
  };

  const soldPercent = Math.round(
    (bookedChairs.length / event.totalChairs) * 100
  );

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HERO / BANNER ================= */}
      <section className="relative h-[300px] lg:h-[400px] overflow-hidden">
        <img
          src={event.banner}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>

            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Live Concert
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Premium Event
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-2 leading-tight">
              {event.name}
            </h1>
            <p className="text-base md:text-lg text-white/90 font-medium">
              feat. <span className="font-bold">{event.artist}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Details + Chair Selection */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ============ EVENT INFO ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-5">
                  Event Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                        Date
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {eventDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                        Time
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {event.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                        Venue
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {event.venue}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Rules */}
                {event.rules && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-amber-900 mb-2">
                          Rules & Instructions
                        </div>
                        <div className="text-xs text-amber-800 whitespace-pre-line leading-relaxed">
                          {event.rules}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ============ CHAIR SELECTION ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Select Your Seats
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {event.totalChairs - bookedChairs.length} of{" "}
                      {event.totalChairs} seats available
                    </p>
                  </div>

                  {selectedChairs.length > 0 && (
                    <button
                      onClick={() => setSelectedChairs([])}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-5 p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white border-2 border-slate-300"></div>
                    <span className="text-xs font-semibold text-slate-600">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#FF6B00]"></div>
                    <span className="text-xs font-semibold text-slate-600">
                      Selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-slate-300"></div>
                    <span className="text-xs font-semibold text-slate-600">
                      Booked
                    </span>
                  </div>
                  <div className="ml-auto text-xs font-bold text-slate-500">
                    Sold: {soldPercent}%
                  </div>
                </div>

                {/* Stage */}
                <div className="mb-6">
                  <div className="w-full max-w-md mx-auto h-2 bg-gradient-to-r from-[#FF6B00] via-[#FF8C42] to-[#FF6B00] rounded-full shadow-lg shadow-orange-500/30"></div>
                  <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                    Stage
                  </div>
                </div>

                {/* Chairs Grid */}
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-10 gap-2 sm:gap-3">
                    {Array.from({ length: event.totalChairs }, (_, i) => i + 1).map(
                      (chairNum) => {
                        const isBooked = bookedChairs.includes(chairNum);
                        const isSelected = selectedChairs.includes(chairNum);
                        return (
                          <button
                            key={chairNum}
                            onClick={() => toggleChair(chairNum)}
                            disabled={isBooked}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                              isBooked
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : isSelected
                                ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/40 scale-110"
                                : "bg-white border-2 border-slate-300 text-slate-700 hover:border-[#FF6B00] hover:bg-orange-50 hover:scale-105"
                            }`}
                            aria-label={`Chair ${chairNum}`}
                          >
                            <Armchair className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="text-[9px] mt-0.5">{chairNum}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Selected summary */}
                {selectedChairs.length > 0 && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">
                          Your Selection
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          {selectedChairs.length} seat
                          {selectedChairs.length > 1 ? "s" : ""} selected
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedChairs
                          .sort((a, b) => a - b)
                          .map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center gap-1 bg-[#FF6B00] text-white text-xs font-bold px-2.5 py-1 rounded-full"
                            >
                              #{c}
                              <button
                                onClick={() => toggleChair(c)}
                                className="hover:bg-white/20 rounded-full p-0.5"
                                aria-label={`Remove chair ${c}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ============ CUSTOMER DETAILS ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-5">
                  Your Details
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ============ PAYMENT ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-5">
                  Payment Method
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      paymentMethod === "online"
                        ? "border-[#FF6B00] bg-orange-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard
                      className={`w-6 h-6 mb-2 ${
                        paymentMethod === "online"
                          ? "text-[#FF6B00]"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="font-bold text-slate-900 text-sm">
                      Pay Online
                    </div>
                    <div className="text-[11px] text-slate-500">
                      UPI, Card
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      paymentMethod === "cod"
                        ? "border-[#FF6B00] bg-orange-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Banknote
                      className={`w-6 h-6 mb-2 ${
                        paymentMethod === "cod"
                          ? "text-[#FF6B00]"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="font-bold text-slate-900 text-sm">
                      Pay at Venue
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Advance on entry
                    </div>
                  </button>
                </div>

                {paymentMethod === "online" && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-700 leading-snug">
                      <strong>Demo mode:</strong> No real payment will be
                      processed. Real Razorpay integration coming soon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ============ RIGHT: SUMMARY ============ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 sticky top-24 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Booking Summary
                </h3>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Seats
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {selectedChairs.length === 0
                          ? "Not selected"
                          : `${selectedChairs.length} seat${
                              selectedChairs.length > 1 ? "s" : ""
                            }`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Event
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {event.name}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedChairs.length > 0 && (
                  <>
                    <div className="pt-4 border-t border-slate-100 space-y-2 text-sm mb-4">
                      <div className="flex justify-between text-slate-600">
                        <span>Ticket Price</span>
                        <span className="font-semibold text-slate-900">
                          ₹{event.ticketPrice} × {selectedChairs.length}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Total</span>
                        <span>₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Advance ({advancePercent}%)</span>
                        <span className="font-bold text-[#FF6B00]">
                          ₹{advanceAmount}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-xs">
                        <span>Pay at venue</span>
                        <span>₹{remainingAmount}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-900">
                          Pay Now
                        </span>
                        <span className="font-black text-[#FF6B00] text-2xl">
                          ₹{advanceAmount}
                        </span>
                      </div>

                      <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {selectedChairs.length === 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <Armchair className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        Select seats to see pricing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}