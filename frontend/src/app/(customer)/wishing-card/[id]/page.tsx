"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Sparkles,
  Cake,
  Heart,
  Check,
  Loader2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { useCelebrationStore } from "@/store/celebrationStore";
import toast from "react-hot-toast";

type Theme = "orange" | "dark" | "pink";

export default function WishingCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const booking = useCelebrationStore((state) =>
    state.bookings.find((b) => b.id === id)
  );
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("orange");
  const [message, setMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useCelebrationStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (booking) {
      setMessage(booking.specialMessage || "");
    }
  }, [booking]);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
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
          href="/my-celebrations"
          className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all"
        >
          Back to My Celebrations
        </Link>
      </div>
    );
  }

  const themes = {
    orange: {
      bg: "bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42]",
      text: "text-white",
      accent: "text-[#3D1C00]",
      btn: "bg-[#FF6B00]",
    },
    dark: {
      bg: "bg-gradient-to-br from-[#3D1C00] to-slate-900",
      text: "text-white",
      accent: "text-[#FF6B00]",
      btn: "bg-slate-900",
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-500 to-rose-400",
      text: "text-white",
      accent: "text-pink-900",
      btn: "bg-pink-500",
    },
  };

  const currentTheme = themes[theme];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `FoodieHub-Card-${booking.celebrantName}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download card");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Hey! Wishing ${booking.celebrantName} a very special ${booking.occasion}! 🎉\n\n"${message}"\n\n- From ${booking.customer.name} & FoodieHub.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const OccasionIcon =
    booking.occasion === "birthday"
      ? Cake
      : booking.occasion === "anniversary"
      ? Heart
      : Sparkles;

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/celebration-success/${booking.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#FF6B00] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Booking
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Customize Your Card
          </h1>
          <p className="text-slate-500 mt-1">
            Design your personalized wishing card to share with {booking.celebrantName}.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* LEFT: Controls */}
            <div className="space-y-6">
              
              {/* Message Input */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <label className="text-sm font-bold text-slate-900 mb-2 block">
                  Edit Your Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] outline-none resize-none"
                  placeholder="Write your special message here..."
                />
              </div>

              {/* Theme Picker */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <label className="text-sm font-bold text-slate-900 mb-3 block">
                  Choose Theme
                </label>
                <div className="flex gap-3">
                  {(Object.keys(themes) as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 h-12 rounded-xl border-2 transition-all relative overflow-hidden ${
                        themes[t].bg
                      } ${
                        theme === t
                          ? "border-[#FF6B00] ring-2 ring-orange-200"
                          : "border-transparent"
                      }`}
                    >
                      {theme === t && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {isDownloading ? "Downloading..." : "Download Image"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Preview */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Live Preview
              </span>
              
              {/* Card Container (This is what gets downloaded) */}
              <div
                ref={cardRef}
                className={`w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center p-8 text-center ${currentTheme.bg} ${currentTheme.text}`}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-[60px] pointer-events-none"></div>

                {/* Brand */}
                <div className="absolute top-6 left-0 right-0 flex justify-center items-center gap-1 opacity-80">
                  <span className="font-black text-xl tracking-tight">
                    Foodie<span className={currentTheme.accent}>Hub.</span>
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center w-full mt-8">
                  <OccasionIcon className={`w-12 h-12 mb-4 ${currentTheme.accent}`} />
                  
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2">
                    {booking.occasion === "birthday" ? "Happy Birthday" : booking.occasion === "anniversary" ? "Happy Anniversary" : "Congratulations"}
                  </span>

                  <h2 className="text-4xl font-black tracking-tight mb-4 leading-tight">
                    {booking.celebrantName}
                  </h2>

                  <div className="w-12 h-0.5 bg-white/30 rounded-full mb-4"></div>

                  <p className="text-sm leading-relaxed italic opacity-90 px-4">
                    &ldquo;{message}&rdquo;
                  </p>

                  <div className="mt-8 text-[11px] font-semibold uppercase tracking-widest opacity-70">
                    With Love,
                    <br />
                    {booking.customer.name}
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4 max-w-xs">
                * Download as image or print to display on your table.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}