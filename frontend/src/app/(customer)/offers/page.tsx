"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Clock,
  ArrowRight,
  Sparkles,
  Gift,
  UtensilsCrossed,
  CalendarDays,
} from "lucide-react";
import { useOfferStore } from "@/store/offerStore";

export default function OffersPage() {
  const allOffers = useOfferStore((state) => state.offers);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useOfferStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // 👇 SCHEDULING LOGIC: Active + Started + Not Expired
  const today = new Date().toISOString().split("T")[0];

  const offers = allOffers.filter((o) => {
    const isActive = o.isActive !== false;
    const hasStarted = !o.startDate || o.startDate <= today;
    const notExpired = o.validUntil >= today;
    return isActive && hasStarted && notExpired;
  });

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading offers...
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-20 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Weekly Offers
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-4">
            Deals you&apos;ll
            <br />
            <span className="text-[#3D1C00]">love.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl opacity-95">
            Fresh offers every week — save big on your favorite dishes.
          </p>
        </div>
      </section>

      {/* ================= OFFERS GRID ================= */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
                Limited Time
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
                Active Offers
              </h2>
            </div>
            <span className="text-sm text-slate-500 font-medium">
              {offers.length} offer{offers.length !== 1 ? "s" : ""} available
            </span>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No offers available right now
              </h3>
              <p className="text-slate-500 mb-6">
                Check back soon — new deals are added every week!
              </p>
              <Link
                href="/menu"
                className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => {
                const endsIn = Math.ceil(
                  (new Date(offer.validUntil).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );
                const endingSoon = endsIn >= 0 && endsIn <= 3;

                return (
                  <div
                    key={offer.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                      {/* Badge */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 bg-white text-[#FF6B00] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg w-fit">
                          <Gift className="w-3.5 h-3.5" />
                          {offer.badge}
                        </span>
                        {endingSoon && (
                          <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg w-fit">
                            <Clock className="w-3 h-3" />
                            {endsIn === 0
                              ? "Ends Today"
                              : `Ends in ${endsIn}d`}
                          </span>
                        )}
                      </div>

                      {/* Discount Badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-[#FF6B00] text-white text-xl font-black px-4 py-2 rounded-xl shadow-xl">
                          {offer.discount}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      
                      {/* Category */}
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                          {offer.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                        {offer.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-grow">
                        {offer.description}
                      </p>

                      {/* Applicable Items chips */}
                      {offer.applicableItems &&
                        offer.applicableItems.length > 0 && (
                          <div className="mb-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                              <UtensilsCrossed className="w-3 h-3" />
                              Applicable on
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {offer.applicableItems
                                .slice(0, 3)
                                .map((item) => (
                                  <span
                                    key={item}
                                    className="text-[11px] font-semibold bg-orange-50 text-orange-700 px-2 py-0.5 rounded"
                                  >
                                    {item}
                                  </span>
                                ))}
                              {offer.applicableItems.length > 3 && (
                                <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  +{offer.applicableItems.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Valid Until */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        Valid till{" "}
                        {new Date(offer.validUntil).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>

                      {/* Date Range (if startDate present) */}
                      {offer.startDate && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-3">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(offer.startDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" }
                          )}{" "}
                          →{" "}
                          {new Date(offer.validUntil).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" }
                          )}
                        </div>
                      )}

                      {/* Terms */}
                      <p className="text-[11px] text-slate-400 italic mb-4">
                        * {offer.terms}
                      </p>

                      {/* CTA */}
                      <Link
                        href="/menu"
                        className="flex items-center justify-between bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50"
                      >
                        <span>Order Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#3D1C00] rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6B00]/30 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                Hungry? Let&apos;s fix that.
              </h3>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Browse our full menu and order your favorites now.
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 px-8 rounded-full transition-all shadow-xl hover:shadow-2xl"
              >
                Browse Menu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}