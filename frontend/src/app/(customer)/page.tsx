"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Star,
  Clock,
  UtensilsCrossed,
  Calendar,
  Car,
  Cake,
  Music,
  Ticket,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  ChefHat,
  Leaf,
  Heart,
  Users,
  PartyPopper,
} from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { useEventStore } from "@/store/eventStore";
import { offers } from "@/lib/offersData";
import { categories } from "@/lib/menuData";

export default function Home() {
  const items = useMenuStore((state) => state.items);
  const events = useEventStore((state) => state.events);
  const getAvailableChairs = useEventStore(
    (state) => state.getAvailableChairs
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useMenuStore.persist.rehydrate();
    useMenuStore.getState().syncWithDefaults();
    useEventStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Bestsellers
  const bestsellers = items
    .filter((i) => i.isBestseller && i.isAvailable !== false)
    .slice(0, 4);

  // 👇 Live events from store
  const now = new Date();
  const upcomingEvents = events
    .filter(
      (e) =>
        e.isActive && new Date(`${e.date}T${e.time}`) >= now
    )
    .slice(0, 2);

  return (
    <div className="flex flex-col">
      
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative bg-[#FF6B00] text-[#3D1C00] py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-center lg:text-left">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-6 opacity-80">
                — Good Food, No Waiting
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
                Crave it.
                <br />
                <span className="text-white">Order it.</span>
              </h1>
              <p className="text-lg md:text-xl font-medium mb-10 max-w-lg mx-auto lg:mx-0 opacity-90">
                Your favorite meals, delivered fast and fresh. From local gems to late-night cravings.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <Link
                  href="/menu"
                  className="group flex items-center gap-3 bg-[#3D1C00] hover:bg-black text-white font-bold py-4 px-8 rounded-full transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Order now
                  <span className="w-8 h-8 bg-[#FF6B00] group-hover:bg-white rounded-full flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#3D1C00]" />
                  </span>
                </Link>
                <span className="text-sm font-semibold underline underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity">
                  Free delivery on your first order
                </span>
              </div>
            </div>

            <div className="relative mx-auto lg:mx-0 lg:ml-auto w-full max-w-lg">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square lg:aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
                  alt="Delicious food bowl"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-orange-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">
                  Average Delivery
                </div>
                <div className="flex items-center gap-2 text-[#3D1C00]">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-black">28 min</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#3D1C00] text-white rounded-2xl p-5 shadow-2xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1">
                  Rated by Locals
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black">4.9</span>
                  <span className="text-sm opacity-60">/ 5</span>
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400 ml-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-[#3D1C00]/20 flex justify-between items-center text-xs font-bold tracking-widest uppercase opacity-70">
            <span>Made for hungry people</span>
            <span className="hidden sm:block">Scroll to explore ↓</span>
          </div>
        </div>
      </section>

      {/* ================= 2. CATEGORIES STRIP ================= */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Browse by Category
            </h2>
            <Link
              href="/menu"
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories
              .filter((c) => c !== "All")
              .map((cat) => (
                <Link
                  key={cat}
                  href={`/menu`}
                  className="group relative bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-orange-200 rounded-2xl p-5 text-center transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-orange-100 text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat}</h3>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ================= 3. BESTSELLERS ================= */}
      {mounted && bestsellers.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                    Loved by everyone
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Bestsellers
                </h2>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B00] hover:gap-3 transition-all"
              >
                View all dishes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.map((item) => (
                <Link
                  key={item.id}
                  href={`/menu/${item.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white rounded-md p-1 shadow-md">
                      <div
                        className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-sm ${
                          item.isVeg ? "border-green-600" : "border-red-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? "bg-green-600" : "bg-red-600"
                          }`}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-[#3D1C00] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      ★ Bestseller
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-green-700" />
                        {item.rating}
                      </div>
                      <span className="text-base font-black text-slate-900">
                        ₹{item.price}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-grow">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= 4. WEEKLY OFFERS ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                  Limited time
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Weekly Offers
              </h2>
            </div>
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B00] hover:gap-3 transition-all"
            >
              View all offers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.slice(0, 3).map((offer) => (
              <Link
                key={offer.id}
                href="/offers"
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-block bg-[#FF6B00] text-white text-lg font-black px-3 py-1.5 rounded-xl shadow-lg">
                      {offer.discount} OFF
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-block bg-white text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                      {offer.badge}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-base font-black text-slate-900 mb-2 leading-tight line-clamp-2">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-grow">
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Valid till{" "}
                    {new Date(offer.validUntil).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. UPCOMING EVENTS / LIVE CONCERTS ================= */}
      {mounted && upcomingEvents.length > 0 && (
        <section className="py-16 bg-[#3D1C00] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B00]/20 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                    Live at FoodieHub
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Upcoming Events
                </h2>
                <p className="text-white/60 text-sm mt-2 max-w-lg">
                  Enjoy live music and exclusive performances with your favorite meals.
                </p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6B00] hover:gap-3 transition-all"
              >
                View all events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => {
                const available = getAvailableChairs(event.id).length;
                const eventDate = new Date(event.date);

                return (
                  <div
                    key={event.id}
                    className="group flex flex-col sm:flex-row gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all"
                  >
                    <div className="sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0 relative">
                      <img
                        src={event.banner}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                          <span className="w-1 h-1 bg-white rounded-full"></span>
                          Live
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">
                          Live Concert
                        </span>
                      </div>
                      <h3 className="text-lg font-black mb-1 leading-tight line-clamp-1">
                        {event.name}
                      </h3>
                      <p className="text-white/60 text-xs mb-4">
                        feat. {event.artist}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                        <span className="flex items-center gap-1.5 text-white/70">
                          <Calendar className="w-3.5 h-3.5" />
                          {eventDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 text-white/70">
                          <Clock className="w-3.5 h-3.5" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1.5 text-white/70">
                          <Users className="w-3.5 h-3.5" />
                          {available} left
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] text-white/50 uppercase tracking-wider">
                            Starting from
                          </div>
                          <div className="text-xl font-black text-[#FF6B00]">
                            ₹{event.ticketPrice}
                          </div>
                        </div>
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5"
                        >
                          Book Now <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================= 6. SERVICES ================= */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PartyPopper className="w-4 h-4 text-[#FF6B00]" />
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                More Than Just Food
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Experience FoodieHub
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Book a table, request a ride, or celebrate something special — we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/table-booking"
              className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-200 transition-colors"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                  Table Booking
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  Reserve your table in advance. Skip the wait, walk right in.
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B00] group-hover:gap-2.5 transition-all">
                  Book a table <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link
              href="/pick-drop"
              className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-200 transition-colors"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                  Pick &amp; Drop
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  We&apos;ll pick you up and drop you back. Enjoy without the worry.
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B00] group-hover:gap-2.5 transition-all">
                  Book a ride <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link
              href="/celebrations"
              className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-200 transition-colors"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <Cake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                  Celebrations
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  Birthdays, anniversaries, and every special moment — we make it memorable.
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B00] group-hover:gap-2.5 transition-all">
                  Plan yours <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 7. RESTAURANT INFO / CONTACT ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                  Visit Us
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
                Come for the food,
                <br />
                stay for the <span className="text-[#FF6B00]">vibe.</span>
              </h2>
              <p className="text-slate-500 mb-8 max-w-md leading-relaxed">
                Dine in with us or order for delivery. Either way, you&apos;re always welcome.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      Address
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      123 Food Street, Flavor Town, Mumbai 400001
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      Call Us
                    </div>
                    <a
                      href="tel:+919876543210"
                      className="text-sm font-semibold text-slate-900 hover:text-[#FF6B00]"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      Email
                    </div>
                    <a
                      href="mailto:hello@foodiehub.com"
                      className="text-sm font-semibold text-slate-900 hover:text-[#FF6B00]"
                    >
                      hello@foodiehub.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      Hours
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      Mon–Sun, 10 AM – 11 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg h-96 lg:h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. FEATURES ================= */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
              Why FoodieHub
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              The FoodieHub Promise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "30 Min Delivery", desc: "Fast delivery right to your doorstep." },
              { icon: ChefHat, title: "Expert Chefs", desc: "Crafted by experienced chefs." },
              { icon: Leaf, title: "Fresh Ingredients", desc: "Locally sourced, daily fresh." },
              { icon: Heart, title: "Made with Love", desc: "Every dish, every time." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all text-center"
                >
                  <div className="w-14 h-14 bg-orange-100 text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 9. FINAL CTA ================= */}
      <section className="pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#3D1C00] rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6B00]/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4">
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