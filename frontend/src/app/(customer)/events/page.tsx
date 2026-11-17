"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Music,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  Users,
  IndianRupee,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";

export default function EventsPage() {
  const events = useEventStore((state) => state.events);
  const getAvailableChairs = useEventStore(
    (state) => state.getAvailableChairs
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useEventStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading events...
      </div>
    );
  }

  const activeEvents = events.filter((e) => e.isActive);

  // Separate upcoming vs past
  const now = new Date();
  const upcomingEvents = activeEvents.filter(
    (e) => new Date(`${e.date}T${e.time}`) >= now
  );

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <section className="relative bg-[#3D1C00] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B00]/30 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF6B00]/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
              Live at FoodieHub
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            Events &amp;
            <br />
            <span className="text-[#FF6B00]">Concerts.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl opacity-90">
            Book your seat for unforgettable nights of music, food, and
            memories.
          </p>
        </div>
      </section>

      {/* ================= EVENTS LIST ================= */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No upcoming events
              </h3>
              <p className="text-slate-500 mb-6">
                Check back soon for new concerts and events
              </p>
              <Link
                href="/menu"
                className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
              >
                Browse Menu Instead
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                    Upcoming Events
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Grab your seats
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => {
                  const available = getAvailableChairs(event.id).length;
                  const booked = event.totalChairs - available;
                  const soldPercent = Math.round(
                    (booked / event.totalChairs) * 100
                  );
                  const eventDate = new Date(event.date);

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      {/* Banner */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={event.banner}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                        {/* Live Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            Live Concert
                          </span>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-[#FF6B00] text-white text-lg font-black px-4 py-2 rounded-xl shadow-xl">
                            ₹{event.ticketPrice}
                          </div>
                        </div>

                        {/* Available Chairs Badge */}
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-[#FF6B00]" />
                            {available} seats left
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">
                            Live Performance
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight line-clamp-2">
                          {event.name}
                        </h3>

                        <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                          feat. {event.artist}
                        </p>

                        {/* Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">
                              {eventDate.toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold truncate">
                              {event.venue}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {booked}/{event.totalChairs} booked
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                soldPercent > 80
                                  ? "text-red-600"
                                  : soldPercent > 50
                                  ? "text-amber-600"
                                  : "text-green-600"
                              }`}
                            >
                              {soldPercent}% sold
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                soldPercent > 80
                                  ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : soldPercent > 50
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                  : "bg-gradient-to-r from-green-500 to-green-600"
                              }`}
                              style={{ width: `${soldPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* CTA */}
                        <button className="w-full flex items-center justify-between bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-orange-500/40 group-hover:shadow-lg">
                          <span className="flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            Book Seats
                          </span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                Hungry between events?
              </h3>
              <p className="text-lg opacity-95 mb-8 max-w-xl mx-auto">
                Order food while you enjoy the show — we&apos;ll deliver to your seat.
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-white text-[#FF6B00] hover:bg-slate-100 font-bold py-4 px-8 rounded-full transition-all shadow-xl"
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