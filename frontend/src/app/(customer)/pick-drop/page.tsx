"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  Mail,
  MessageSquare,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  Sparkles,
  Check,
  Navigation,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useTripStore } from "@/store/tripStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const SERVICE_CHARGES = 299;
const MAX_PASSENGERS = 6;

export default function PickDropPage() {
  const router = useRouter();
  const addTrip = useTripStore((state) => state.addTrip);
  const user = useAuthStore((state) => state.user);

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [returnLocation, setReturnLocation] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  useEffect(() => {
    useTripStore.persist.rehydrate();
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

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation.trim()) {
      toast.error("Please enter pickup location");
      return;
    }
    if (!pickupDate) {
      toast.error("Please select pickup date");
      return;
    }
    if (!pickupTime) {
      toast.error("Please select pickup time");
      return;
    }
    if (!returnLocation.trim()) {
      toast.error("Please enter return location");
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
    if (passengers < 1 || passengers > MAX_PASSENGERS) {
      toast.error(`Passengers must be between 1 and ${MAX_PASSENGERS}`);
      return;
    }

    setIsProcessing(true);
    if (paymentMethod === "online") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const trip = addTrip({
      customer: {
        name: customerName.trim(),
        phone: customerPhone,
        email: customerEmail.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
      },
      pickupLocation: pickupLocation.trim(),
      pickupDate,
      pickupTime,
      passengers,
      returnLocation: returnLocation.trim(),
      serviceCharges: SERVICE_CHARGES,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      status: "requested",
    });

    setIsProcessing(false);
    toast.success("Pick & Drop request placed! 🚗");
    router.push(`/my-trips/${trip.id}`);
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

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
              We Pick You Up
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1] mb-4">
            Pick &amp; Drop
            <br />
            Service
          </h1>
          <p className="text-lg opacity-95 max-w-2xl">
            We&apos;ll pick you up, bring you to our restaurant, and drop you
            back home. Relax and enjoy — we handle the ride.
          </p>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Info Banner */}
              <div className="bg-blue-50 rounded-3xl p-5 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-900 text-sm mb-1">
                      How it works
                    </div>
                    <p className="text-xs text-blue-700 leading-snug">
                      We pick you up from your location → Bring you to
                      FoodieHub → Enjoy your meal → Drop you back home.
                    </p>
                  </div>
                </div>
              </div>

              {/* ============ TRIP DETAILS ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Trip Details
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Pickup Location */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#FF6B00]" /> Pickup Location
                    </label>
                    <input
                      type="text"
                      placeholder="Where should we pick you up from?"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#FF6B00]" /> Pickup Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        min={today}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#FF6B00]" /> Pickup Time
                      </label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-[#FF6B00]" /> Passengers
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPassengers(n)}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            passengers === n
                              ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Return Location */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#FF6B00]" /> Return / Drop Location
                    </label>
                    <input
                      type="text"
                      placeholder="Where should we drop you off?"
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ============ CONTACT DETAILS ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Your Details
                  </h2>
                </div>

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
                      placeholder="Special requests (optional) — e.g., wheelchair access, child seat..."
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
              </div>

              {/* ============ PAYMENT ============ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    type="button"
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
                    type="button"
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
                      Pay to Driver
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cash payment
                    </div>
                  </button>
                </div>

                {paymentMethod === "online" && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-700 leading-snug">
                      <strong>Demo mode:</strong> No real payment will be
                      processed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ============ RIGHT: Summary ============ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 sticky top-24 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                  Trip Summary
                </h3>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pickup
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {pickupLocation || "Not set"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date & Time
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {pickupDate
                          ? `${new Date(pickupDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )} · ${pickupTime || "--:--"}`
                          : "Not set"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Passengers
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {passengers} {passengers === 1 ? "person" : "people"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Drop
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {returnLocation || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Fare</span>
                    <span className="font-semibold text-slate-900">
                      ₹{SERVICE_CHARGES}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Included in Trip</span>
                    <span className="text-xs font-semibold text-green-600">
                      Round-trip
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-black text-[#FF6B00] text-2xl">
                      ₹{SERVICE_CHARGES}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
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
                      Book Pick &amp; Drop
                    </>
                  )}
                </button>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Cancellation allowed up to 2 hours before pickup. Full
                      refund guaranteed.
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