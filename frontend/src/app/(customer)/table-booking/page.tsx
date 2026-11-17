"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Phone,
  Mail,
  MessageSquare,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  Sparkles,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useBookingStore, Table } from "@/store/bookingStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3 | 4 | 5;

export default function TableBookingPage() {
  const router = useRouter();
  const tables = useBookingStore((state) => state.tables);
  const bookings = useBookingStore((state) => state.bookings);
  const addBooking = useBookingStore((state) => state.addBooking);
  const getAvailableTables = useBookingStore(
    (state) => state.getAvailableTables
  );
  const settings = useSettingsStore((state) => state.settings);
  const user = useAuthStore((state) => state.user);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  useEffect(() => {
    useBookingStore.persist.rehydrate();
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

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  // Available tables for selected slot
  const availableTables =
    selectedDate && selectedTime
      ? getAvailableTables(selectedDate, selectedTime, guests)
      : [];

  // Estimated bill (rough: ₹500 per guest)
  const estimatedBill = guests * 500;
  const advanceAmount = Math.round(
    (estimatedBill * settings.advancePaymentPercent) / 100
  );

  // ================= HANDLERS =================
  const handleNext = () => {
    if (step === 1 && !selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (step === 2 && !selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    if (step === 3 && guests < 1) {
      toast.error("Please select number of guests");
      return;
    }
    if (step === 4 && !selectedTable) {
      toast.error("Please select a table");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5) as Step);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please fill your name and phone");
      return;
    }
    if (customerPhone.length !== 10) {
      toast.error("Enter valid 10-digit phone");
      return;
    }
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }

    setIsProcessing(true);
    if (paymentMethod === "online") {
      await new Promise((resolve) => setTimeout(resolve, 1800));
    }

    const booking = addBooking({
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      customer: {
        name: customerName.trim(),
        phone: customerPhone,
        email: customerEmail.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
      },
      date: selectedDate,
      time: selectedTime,
      guests,
      estimatedBill,
      advancePaid: advanceAmount,
      advancePercent: settings.advancePaymentPercent,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      status: "confirmed",
    });

    setIsProcessing(false);
    toast.success("Table booked successfully! 🎉");
    router.push(`/table-booking/${booking.id}`);
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  // If booking disabled
  if (!settings.tableBookingEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          Table Booking Unavailable
        </h1>
        <p className="text-slate-500 mb-8">
          Table booking is currently unavailable. Please check back later.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const steps = [
    { n: 1, label: "Date", icon: Calendar },
    { n: 2, label: "Time", icon: Clock },
    { n: 3, label: "Guests", icon: Users },
    { n: 4, label: "Table", icon: MapPin },
    { n: 5, label: "Details", icon: User },
  ];

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Reserve Your Table
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1] mb-4">
            Book a Table
          </h1>
          <p className="text-lg opacity-95 max-w-xl">
            Skip the wait. Reserve your table in advance and enjoy a seamless dining experience.
          </p>
        </div>
      </section>

      {/* ================= PROGRESS STEPS ================= */}
      <section className="bg-white border-b border-slate-100 sticky top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.n;
              const isDone = step > s.n;
              return (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                        isActive ? "text-[#FF6B00]" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full ${
                        isDone ? "bg-green-500" : "bg-slate-200"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Step Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                
                {/* ============ STEP 1: DATE ============ */}
                {step === 1 && (
                  <div>
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                        Step 1 of 5
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        Select a Date
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Choose your preferred dining date
                      </p>
                    </div>

                    <input
                      type="date"
                      value={selectedDate}
                      min={today}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-lg font-semibold"
                    />

                    {/* Quick picks */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4].map((offset) => {
                        const d = new Date();
                        d.setDate(d.getDate() + offset);
                        const val = d.toISOString().split("T")[0];
                        const label =
                          offset === 0
                            ? "Today"
                            : offset === 1
                            ? "Tomorrow"
                            : d.toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              });
                        return (
                          <button
                            key={val}
                            onClick={() => setSelectedDate(val)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                              selectedDate === val
                                ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {selectedDate && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-green-900">
                            Date selected
                          </div>
                          <div className="text-xs text-green-700">
                            {new Date(selectedDate).toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ============ STEP 2: TIME ============ */}
                {step === 2 && (
                  <div>
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                        Step 2 of 5
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        Select a Time
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Available slots for {new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {settings.bookingTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-3 rounded-xl text-sm font-bold transition-all ${
                            selectedTime === slot
                              ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200"
                              : "bg-slate-50 text-slate-700 border border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============ STEP 3: GUESTS ============ */}
                {step === 3 && (
                  <div>
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                        Step 3 of 5
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        Number of Guests
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Max {settings.maxGuestsPerBooking} guests per booking
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-6 py-8">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-14 h-14 rounded-full bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 font-black text-2xl transition-colors flex items-center justify-center shadow-sm"
                      >
                        −
                      </button>
                      <div className="text-center">
                        <div className="text-6xl font-black text-slate-900">
                          {guests}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">
                          {guests === 1 ? "Guest" : "Guests"}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setGuests(
                            Math.min(settings.maxGuestsPerBooking, guests + 1)
                          )
                        }
                        className="w-14 h-14 rounded-full bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-700 font-black text-2xl transition-colors flex items-center justify-center shadow-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {[2, 3, 4, 6, 8].map((n) => (
                        <button
                          key={n}
                          onClick={() => setGuests(n)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all ${
                            guests === n
                              ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============ STEP 4: TABLE ============ */}
                {step === 4 && (
                  <div>
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                        Step 4 of 5
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        Select Your Table
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {availableTables.length} table
                        {availableTables.length !== 1 ? "s" : ""} available for{" "}
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </p>
                    </div>

                    {availableTables.length === 0 ? (
                      <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-200">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          No tables available
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 max-w-sm mx-auto">
                          All tables are booked for this date & time. Please
                          try a different slot.
                        </p>
                        <button
                          onClick={() => setStep(2)}
                          className="text-sm font-bold text-[#FF6B00] hover:underline"
                        >
                          ← Change time slot
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableTables.map((table) => {
                          const isSelected = selectedTable?.id === table.id;
                          return (
                            <button
                              key={table.id}
                              onClick={() => setSelectedTable(table)}
                              className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                                isSelected
                                  ? "border-[#FF6B00] bg-orange-50 shadow-lg shadow-orange-500/10"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                                  isSelected
                                    ? "bg-[#FF6B00] text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div className="font-black text-slate-900 text-base mb-1">
                                {table.number}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                {table.section}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Users className="w-3.5 h-3.5" />
                                Up to {table.capacity} guests
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ============ STEP 5: DETAILS + PAYMENT ============ */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                        Step 5 of 5
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        Your Details
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Almost done — confirm your booking details
                      </p>
                    </div>

                    {/* Contact info */}
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
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                        <textarea
                          placeholder="Special requests (optional) — e.g., window seat, birthday setup..."
                          rows={3}
                          value={specialRequests}
                          onChange={(e) =>
                            setSpecialRequests(e.target.value.slice(0, 300))
                          }
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                        ></textarea>
                        <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400">
                          {specialRequests.length}/300
                        </span>
                      </div>
                    </div>

                    {/* Advance Payment */}
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-3">
                        Advance Payment
                      </h3>

                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">
                            Estimated Bill
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            ₹{estimatedBill}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-900">
                            Advance ({settings.advancePaymentPercent}%)
                          </span>
                          <span className="text-2xl font-black text-[#FF6B00]">
                            ₹{advanceAmount}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                          Pay {settings.advancePaymentPercent}% now, rest at
                          restaurant
                        </p>
                      </div>

                      {/* Payment method */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod("online")}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            paymentMethod === "online"
                              ? "border-[#FF6B00] bg-orange-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <CreditCard
                            className={`w-5 h-5 mb-2 ${
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
                            className={`w-5 h-5 mb-2 ${
                              paymentMethod === "cod"
                                ? "text-[#FF6B00]"
                                : "text-slate-400"
                            }`}
                          />
                          <div className="font-bold text-slate-900 text-sm">
                            Pay at Restaurant
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Advance on arrival
                          </div>
                        </button>
                      </div>

                      {paymentMethod === "online" && (
                        <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-blue-700 leading-snug">
                            <strong>Demo mode:</strong> No real payment will be
                            processed.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= NAVIGATION ================= */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  {step < 5 ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Confirm Booking · ₹{advanceAmount}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 sticky top-40 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Booking Summary
                </h3>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {selectedDate
                          ? new Date(selectedDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not selected"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Time
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {selectedTime || "Not selected"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Guests
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Table
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {selectedTable
                          ? `${selectedTable.number} · ${selectedTable.section}`
                          : "Not selected"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTable && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-slate-600">Estimated Bill</span>
                      <span className="font-semibold text-slate-900">
                        ₹{estimatedBill}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">
                        Advance Payable
                      </span>
                      <span className="font-black text-[#FF6B00] text-xl">
                        ₹{advanceAmount}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Free cancellation up to{" "}
                      {settings.cancellationHoursBefore} hours before your
                      booking.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}