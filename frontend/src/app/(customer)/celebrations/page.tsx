"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cake,
  Heart,
  Sparkles,
  Check,
  ArrowRight,
  PartyPopper,
  Star,
  Calendar,
} from "lucide-react";
import { useCelebrationStore } from "@/store/celebrationStore";

export default function CelebrationsPage() {
  const packages = useCelebrationStore((state) => state.packages);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCelebrationStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  const activePackages = packages.filter((p) => p.isActive);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <PartyPopper className="w-4 h-4" />
            Celebrate With Us
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            Make it
            <br />
            <span className="text-[#3D1C00]">unforgettable.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-95">
            Birthdays, anniversaries, or just because — we&apos;ve got the perfect packages to make your special day truly special.
          </p>
        </div>
      </section>

      {/* ================= OCCASIONS QUICK STRIP ================= */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-pink-50 rounded-2xl border border-pink-100">
              <Cake className="w-6 h-6 text-pink-600" />
              <span className="font-bold text-pink-900 text-sm">Birthdays</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100">
              <Heart className="w-6 h-6 text-red-600" />
              <span className="font-bold text-red-900 text-sm">Anniversaries</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-purple-900 text-sm">Other Events</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PACKAGES ================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
              Choose Your Experience
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Celebration Packages
            </h2>
          </div>

          {activePackages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <Cake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No packages available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative group bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 flex flex-col ${
                    pkg.popular
                      ? "border-[#FF6B00] shadow-2xl md:-translate-y-4"
                      : "border-slate-100 hover:border-orange-200 hover:shadow-xl"
                  }`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute top-0 inset-x-0 z-20 flex justify-center -translate-y-1/2">
                      <div className="bg-[#FF6B00] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-white" /> Most Popular
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <h3 className="text-xl font-black text-white leading-tight">{pkg.name}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black text-slate-900">₹{pkg.price}</span>
                      <span className="text-sm text-slate-500 font-medium">/ package</span>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-6">{pkg.description}</p>

                    {/* Features */}
                    <div className="space-y-3 mb-8 flex-grow">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-slate-700 font-medium leading-snug">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/celebrations/book?package=${pkg.id}`}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                        pkg.popular
                          ? "bg-[#FF6B00] hover:bg-[#E56000] text-white shadow-lg shadow-orange-500/30"
                          : "bg-[#3D1C00] hover:bg-slate-900 text-white"
                      }`}
                    >
                      Book This Package <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BOTTOM INFO ================= */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-orange-100 text-[#FF6B00] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Need a custom plan?</h3>
                <p className="text-slate-500 mt-1">We can customize any package to fit your exact needs and budget.</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors whitespace-nowrap"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}