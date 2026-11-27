"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  IndianRupee,
  CalendarDays,
  Ticket,
  Car,
  Cake,
  ArrowUpRight,
  Clock,
  Music,
  ChevronRight,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useBookingStore } from "@/store/bookingStore";
import { useTripStore } from "@/store/tripStore";
import { useEventStore } from "@/store/eventStore";
import { useCelebrationStore } from "@/store/celebrationStore";

export default function AdminDashboard() {
  const orders = useOrderStore((state) => state.orders);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);

  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);

  const trips = useTripStore((state) => state.trips);
  const fetchTrips = useTripStore((state) => state.fetchTrips);

  const events = useEventStore((state) => state.events);
  const tickets = useEventStore((state) => state.tickets);
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const fetchTickets = useEventStore((state) => state.fetchTickets);

  const celebrations = useCelebrationStore((state) => state.bookings);
  const fetchCelebrations = useCelebrationStore((state) => state.fetchBookings);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchBookings();
    fetchTrips();
    fetchEvents();
    fetchTickets();
    fetchCelebrations();
    setMounted(true);
  }, [fetchOrders, fetchBookings, fetchTrips, fetchEvents, fetchTickets, fetchCelebrations]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading dashboard...</div>;
  }

  // ================= CALCULATIONS =================
  const foodRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const bookingRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.advancePaid, 0);

  const tripRevenue = trips
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.serviceCharges, 0);

  const ticketRevenue = tickets
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.advancePaid, 0);

  const celebrationRevenue = celebrations
    .filter((c) => c.status !== "cancelled")
    .reduce((sum, c) => sum + c.advancePaid, 0);

  const totalRevenue = foodRevenue + bookingRevenue + tripRevenue + ticketRevenue + celebrationRevenue;

  const totalOrders = orders.length + bookings.length + trips.length + tickets.length + celebrations.length;

  const activeDeliveries = orders.filter((o) =>
    ["driver-assigned", "picked-up", "out-for-delivery"].includes(o.status)
  ).length;

  const totalTableBookings = bookings.filter((b) => b.status === "confirmed").length;
  const totalConcertBookings = tickets.filter((t) => t.status === "confirmed").length;
  const totalTripRequests = trips.filter((t) => t.status === "requested").length;
  const totalCelebrations = celebrations.filter((c) => c.status === "confirmed").length;

  const upcomingEvents = events
    .filter((e) => new Date(e.date) > new Date() && e.isActive)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Business Overview</span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">Welcome back, Admin</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Here is what&apos;s happening with your restaurant today.</p>
        </div>
        <div className="flex items-center justify-center w-full md:w-auto gap-2 text-xs md:text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="w-4 h-4 text-[#FF6B00]" />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#3D1C00] to-slate-900 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10">
                <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                <TrendingUp className="w-3 h-3" /> All Time
              </span>
            </div>
            <div className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="text-2xl md:text-4xl font-black text-white">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-white/50 mt-2">Combined gross revenue</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 text-[#FF6B00] rounded-xl md:rounded-2xl flex items-center justify-center"><ShoppingBag className="w-5 h-5 md:w-6 md:h-6" /></div>
            <Link href="/admin/orders" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-[#FF6B00] flex items-center gap-1">View <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Orders</div>
          <div className="text-2xl md:text-3xl font-black text-slate-900">{totalOrders}</div>
          <div className="text-[10px] text-slate-400 mt-2">Food, Bookings, Trips, etc.</div>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center"><Car className="w-5 h-5 md:w-6 md:h-6" /></div>
            <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">{activeDeliveries}</span>
          </div>
          <div className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Active Deliveries</div>
          <div className="text-2xl md:text-3xl font-black text-slate-900">{activeDeliveries}</div>
          <div className="text-[10px] text-slate-400 mt-2">Currently on the way</div>
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 text-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center"><Users className="w-5 h-5 md:w-6 md:h-6" /></div>
          </div>
          <div className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Customer Activity</div>
          <div className="text-2xl md:text-3xl font-black text-slate-900">{new Set(orders.map(o => o.customer.phone)).size}</div>
          <div className="text-[10px] text-slate-400 mt-2">Unique customers</div>
        </div>
      </div>

      {/* MODULE BREAKDOWN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link href="/admin/bookings" className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:border-orange-200 hover:shadow-md transition-all group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-50 text-pink-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><CalendarDays className="w-4 h-4 md:w-5 md:h-5" /></div>
          <div><div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Table Bookings</div><div className="text-lg md:text-xl font-black text-slate-900">{totalTableBookings}</div></div>
        </Link>

        <Link href="/admin/events" className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:border-orange-200 hover:shadow-md transition-all group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Ticket className="w-4 h-4 md:w-5 md:h-5" /></div>
          <div><div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Concert Tickets</div><div className="text-lg md:text-xl font-black text-slate-900">{totalConcertBookings}</div></div>
        </Link>

        <Link href="/admin/trips" className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:border-orange-200 hover:shadow-md transition-all group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-50 text-cyan-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Car className="w-4 h-4 md:w-5 md:h-5" /></div>
          <div><div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Pick & Drop</div><div className="text-lg md:text-xl font-black text-slate-900">{totalTripRequests}</div></div>
        </Link>

        <Link href="/admin/celebrations" className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:border-orange-200 hover:shadow-md transition-all group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Cake className="w-4 h-4 md:w-5 md:h-5" /></div>
          <div><div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">Celebrations</div><div className="text-lg md:text-xl font-black text-slate-900">{totalCelebrations}</div></div>
        </Link>
      </div>

      {/* RECENT ORDERS & EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[10px] md:text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">No orders yet.</div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-2 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 text-[#FF6B00] rounded-lg md:rounded-xl flex items-center justify-center font-black flex-shrink-0">{order.customer.name.charAt(0)}</div>
                    <div className="min-w-0"><div className="font-bold text-slate-900 text-xs md:text-sm truncate">{order.customer.name}</div><div className="text-[9px] md:text-[10px] font-mono text-slate-500 truncate">{order.id}</div></div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-slate-900 text-sm md:text-base">₹{order.total}</div>
                    <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${order.status === "delivered" ? "text-green-600" : order.status === "cancelled" ? "text-red-600" : "text-amber-600"}`}>{order.status.replace("-", " ")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2"><Music className="w-4 h-4 text-[#FF6B00]" /> Upcoming Events</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">No upcoming events.</div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/admin/events/${event.id}`} className="block p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FF6B00] hover:bg-orange-50 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><ChevronRight className="w-3 h-3 text-[#FF6B00]" /></div>
                  </div>
                  <h3 className="font-black text-slate-900 text-xs md:text-sm leading-tight mb-1 truncate">{event.name}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 truncate">{event.artist}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}