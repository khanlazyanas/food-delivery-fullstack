"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  ArrowRight,
  Download,
  Cake,
  Heart,
  Sparkles,
  User,
  Phone,
  MessageSquare,
  PartyPopper,
  Gift,
  Camera,
} from "lucide-react";
import { useCelebrationStore } from "@/store/celebrationStore";
import toast from "react-hot-toast";

export default function CelebrationSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const booking = useCelebrationStore((state) =>
    state.bookings.find((b) => b.id === id)
  );
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    useCelebrationStore.persist.rehydrate();
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

  const handleDownload = () => {
    if (!booking) return;
    const ticket = `
========================================
     FOODIEHUB CELEBRATION RECEIPT
========================================
Booking ID: ${booking.id}
Date: ${new Date(booking.createdAt).toLocaleString("en-IN")}
Status: ${booking.status.toUpperCase()}

---------- EVENT DETAILS ----------
Occasion: ${booking.occasion.toUpperCase()}
Package: ${booking.packageName}
Date: ${booking.date}
Time: ${booking.time}
Guests: ${booking.guests}

---------- CELEBRANT ----------
Name: ${booking.celebrantName}
Message: "${booking.specialMessage}"
${booking.specialRequests ? `Requests: ${booking.specialRequests}` : ""}

---------- CUSTOMER ----------
Name: ${booking.customer.name}
Phone: ${booking.customer.phone}

---------- PAYMENT ----------
Total Package: ₹${booking.totalPrice}
Advance Paid (${Math.round((booking.advancePaid / booking.totalPrice) * 100)}%): ₹${booking.advancePaid}
Pay at Venue: ₹${booking.totalPrice - booking.advancePaid}
Method: ${booking.paymentMethod.toUpperCase()}
Payment Status: ${booking.paymentStatus.toUpperCase()}

========================================
Show this receipt at the restaurant.
We can't wait to celebrate with you! 🎉
    `.trim();

    const blob = new Blob([ticket], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FoodieHub-Celebration-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
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
          href="/celebrations"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Book a Celebration
        </Link>
      </div>
    );
  }

  const getOccasionIcon = () => {
    switch (booking.occasion) {
      case "birthday": return <Cake className="w-12 h-12 text-pink-500" />;
      case "anniversary": return <Heart className="w-12 h-12 text-red-500" />;
      default: return <Sparkles className="w-12 h-12 text-purple-500" />;
    }
  };

  const getOccasionText = () => {
    switch (booking.occasion) {
      case "birthday": return "Birthday";
      case "anniversary": return "Anniversary";
      default: return "Special Event";
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-orange-200">
            {getOccasionIcon()}
          </div>

          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase opacity-90 mb-3">
            Booking Confirmed
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
            Let&apos;s Celebrate,
            <br />
            <span className="text-white">{booking.customer.name.split(" ")[0]}! 🎉</span>
          </h1>

          <p className="text-lg opacity-95 max-w-lg mx-auto">
            Your {getOccasionText().toLowerCase()} package is booked. We can&apos;t wait to make it unforgettable!
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
                  <span className="text-2xl font-black text-slate-900">{booking.id}</span>
                  <button onClick={handleCopyId} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Total Package
                </div>
                <div className="text-3xl font-black text-[#FF6B00]">₹{booking.totalPrice}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment:</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${booking.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                Advance {booking.paymentStatus}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                via {booking.paymentMethod === "cod" ? "At Venue" : "Online"}
              </span>
            </div>
          </div>

          {/* ================= EVENT DETAILS ================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-[#FF6B00]" />
              Event Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <Calendar className="w-5 h-5 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase text-slate-500">Date</div>
                <div className="text-sm font-bold text-slate-900">{new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <Clock className="w-5 h-5 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase text-slate-500">Time</div>
                <div className="text-sm font-bold text-slate-900">{booking.time}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <Users className="w-5 h-5 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase text-slate-500">Guests</div>
                <div className="text-sm font-bold text-slate-900">{booking.guests}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <Gift className="w-5 h-5 text-[#FF6B00] mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase text-slate-500">Package</div>
                <div className="text-sm font-bold text-slate-900 truncate">{booking.packageName}</div>
              </div>
            </div>
          </div>

          {/* ================= WISHING CARD PREVIEW ================= */}
          <div className="bg-[#3D1C00] rounded-3xl p-6 md:p-8 shadow-2xl mb-6 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/30 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6B00] mb-4">
                Your Personalized Wishing Card
              </span>
              
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 border-4 border-[#FF6B00] shadow-lg overflow-hidden">
                {booking.celebrantPhoto ? (
                  <img src={booking.celebrantPhoto} alt={booking.celebrantName} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <h4 className="text-3xl font-black text-white tracking-tight mb-2">
                {booking.celebrantName}
              </h4>
              
              <p className="text-sm text-white/80 italic max-w-md mx-auto leading-relaxed">
                &ldquo;{booking.specialMessage}&rdquo;
              </p>
              
              <div className="mt-6 flex items-center gap-2 text-white/50 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                From {booking.customer.name}
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              </div>
            </div>
          </div>

          {/* 👇 NAYA: Customize Wishing Card Button */}
          <div className="mb-6">
            <Link
              href={`/wishing-card/${booking.id}`}
              className="w-full flex items-center justify-center gap-2 bg-[#3D1C00] hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg group"
            >
              <Sparkles className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
              Customize & Download Wishing Card
            </Link>
          </div>

          {/* ================= PAYMENT BREAKDOWN ================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Package Price</span>
                <span className="font-semibold text-slate-900">₹{booking.totalPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance Paid</span>
                <span className="font-bold text-[#FF6B00]">₹{booking.advancePaid}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900 text-base">Pay at Venue</span>
                <span className="font-black text-slate-900 text-2xl">₹{booking.totalPrice - booking.advancePaid}</span>
              </div>
            </div>
          </div>

          {/* ================= CONTACT & NOTES ================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="text-lg font-black text-slate-900 mb-5 tracking-tight">
              Additional Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Contact</div>
                  <div className="text-sm font-semibold text-slate-900">{booking.customer.name} · +91 {booking.customer.phone}</div>
                </div>
              </div>
              
              {booking.specialRequests && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Special Requests</div>
                    <div className="text-sm text-slate-700 italic">&ldquo;{booking.specialRequests}&rdquo;</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border-2 border-slate-200 transition-all group"
            >
              <Download className="w-5 h-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
              Download Receipt
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/my-celebrations"
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30"
              >
                My Celebrations <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl border border-slate-200 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}