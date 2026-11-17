"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Cake,
  Heart,
  Sparkles,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Banknote,
  Loader2,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useCelebrationStore } from "@/store/celebrationStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package");

  const packages = useCelebrationStore((state) => state.packages);
  const addBooking = useCelebrationStore((state) => state.addBooking);
  const settings = useSettingsStore((state) => state.settings);
  const user = useAuthStore((state) => state.user);

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [occasion, setOccasion] = useState<"birthday" | "anniversary" | "other">("birthday");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [celebrantName, setCelebrantName] = useState("");
  const [celebrantPhoto, setCelebrantPhoto] = useState("");
  const [specialMessage, setSpecialMessage] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  useEffect(() => {
    useCelebrationStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name);
      setCustomerPhone((prev) => prev || user.phone);
    }
  }, [user]);

  if (!mounted) return <div className="text-center py-24 text-slate-500">Loading...</div>;

  const selectedPackage = packages.find((p) => p.id === packageId);

  if (!selectedPackage) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Package not found</h1>
        <Link href="/celebrations" className="inline-block bg-[#FF6B00] text-white font-bold py-3 px-8 rounded-full">
          Back to Packages
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const advancePercent = settings.advancePaymentPercent || 50;
  const advanceAmount = Math.round((selectedPackage.price * advancePercent) / 100);
  const remainingAmount = selectedPackage.price - advanceAmount;

  const handleConfirm = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }
    if (!celebrantName.trim()) {
      toast.error("Please enter celebrant name");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please fill your contact details");
      return;
    }
    if (customerPhone.length !== 10) {
      toast.error("Enter valid 10-digit phone");
      return;
    }

    setIsProcessing(true);
    if (paymentMethod === "online") {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const booking = addBooking({
      occasion,
      celebrantName: celebrantName.trim(),
      celebrantPhoto: celebrantPhoto.trim() || undefined,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      date,
      time,
      guests,
      specialMessage: specialMessage.trim(),
      specialRequests: specialRequests.trim() || undefined,
      totalPrice: selectedPackage.price,
      advancePaid: advanceAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      status: "confirmed",
      customer: {
        name: customerName.trim(),
        phone: customerPhone,
        email: user?.email,
      },
    });

    setIsProcessing(false);
    toast.success("Celebration Booked! 🎉");
    router.push(`/celebration-success/${booking.id}`);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/celebrations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#FF6B00] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                Almost There
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
                Book Your Celebration
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {selectedPackage.name}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Occasion */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">What are we celebrating?</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setOccasion("birthday")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${occasion === "birthday" ? "border-[#FF6B00] bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Cake className={`w-6 h-6 ${occasion === "birthday" ? "text-[#FF6B00]" : "text-slate-400"}`} />
                    <span className={`text-sm font-bold ${occasion === "birthday" ? "text-slate-900" : "text-slate-600"}`}>Birthday</span>
                  </button>
                  <button
                    onClick={() => setOccasion("anniversary")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${occasion === "anniversary" ? "border-[#FF6B00] bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Heart className={`w-6 h-6 ${occasion === "anniversary" ? "text-[#FF6B00]" : "text-slate-400"}`} />
                    <span className={`text-sm font-bold ${occasion === "anniversary" ? "text-slate-900" : "text-slate-600"}`}>Anniversary</span>
                  </button>
                  <button
                    onClick={() => setOccasion("other")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${occasion === "other" ? "border-[#FF6B00] bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Sparkles className={`w-6 h-6 ${occasion === "other" ? "text-[#FF6B00]" : "text-slate-400"}`} />
                    <span className={`text-sm font-bold ${occasion === "other" ? "text-slate-900" : "text-slate-600"}`}>Other</span>
                  </button>
                </div>
              </div>

              {/* 2. Date, Time & Guests */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">When & How Many?</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[#FF6B00]" /> Date</label>
                    <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#FF6B00]" /> Time</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5"><Users className="w-3 h-3 text-[#FF6B00]" /> Guests</label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 8, 10, 15].map((n) => (
                      <button key={n} onClick={() => setGuests(n)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${guests === n ? "bg-[#FF6B00] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Celebrant Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Celebrant Details</h2>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Celebrant's Name *" value={celebrantName} onChange={(e) => setCelebrantName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 border border-slate-200 focus:border-[#FF6B00] outline-none" />
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" placeholder="Photo URL (optional)" value={celebrantPhoto} onChange={(e) => setCelebrantPhoto(e.target.value)} className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 border border-slate-200 focus:border-[#FF6B00] outline-none" />
                  </div>
                  <textarea placeholder="Special Message (for wishing card) *" rows={3} value={specialMessage} onChange={(e) => setSpecialMessage(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 border border-slate-200 focus:border-[#FF6B00] outline-none resize-none"></textarea>
                  <textarea placeholder="Any special requests? (optional)" rows={2} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 border border-slate-200 focus:border-[#FF6B00] outline-none resize-none"></textarea>
                </div>
              </div>

              {/* 4. Contact Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Contact Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 border border-slate-200 focus:border-[#FF6B00] outline-none" />
                  <input type="tel" placeholder="Phone Number *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 border border-slate-200 focus:border-[#FF6B00] outline-none" />
                </div>
              </div>

            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 sticky top-24 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Summary</h2>
                
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex gap-3 mb-3">
                    <img src={selectedPackage.image} alt={selectedPackage.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{selectedPackage.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{occasion === "birthday" ? "Birthday" : occasion === "anniversary" ? "Anniversary" : "Other Event"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm mb-6 border-b border-slate-100 pb-6">
                  <div className="flex justify-between text-slate-600"><span>Package Price</span><span className="font-semibold text-slate-900">₹{selectedPackage.price}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Advance ({advancePercent}%)</span><span className="font-bold text-[#FF6B00]">₹{advanceAmount}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Pay at Restaurant</span><span className="font-semibold text-slate-900">₹{remainingAmount}</span></div>
                </div>

                <div className="mb-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Payment Method</label>
                  <div className="space-y-2">
                    <button onClick={() => setPaymentMethod("online")} className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 text-left ${paymentMethod === "online" ? "border-[#FF6B00] bg-orange-50" : "border-slate-200"}`}>
                      <CreditCard className={`w-5 h-5 ${paymentMethod === "online" ? "text-[#FF6B00]" : "text-slate-400"}`} />
                      <span className="text-sm font-bold text-slate-900">Pay Online</span>
                    </button>
                    <button onClick={() => setPaymentMethod("cod")} className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 text-left ${paymentMethod === "cod" ? "border-[#FF6B00] bg-orange-50" : "border-slate-200"}`}>
                      <Banknote className={`w-5 h-5 ${paymentMethod === "cod" ? "text-[#FF6B00]" : "text-slate-400"}`} />
                      <span className="text-sm font-bold text-slate-900">Pay Advance at Venue</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
                  <span className="font-black text-slate-900">Pay Now</span>
                  <span className="font-black text-[#FF6B00] text-2xl">₹{advanceAmount}</span>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:bg-slate-400"
                >
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Check className="w-4 h-4" /> Confirm Booking</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CelebrationBookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-24">Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}