"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  ShoppingBag,
  CalendarDays,
  Car,
  Ticket,
  Cake,
  ChevronRight,
  X,
  IndianRupee,
  Star,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useBookingStore } from "@/store/bookingStore";
import { useTripStore } from "@/store/tripStore";
import { useEventStore } from "@/store/eventStore";
import { useCelebrationStore } from "@/store/celebrationStore";

// Combined Customer Type
type CustomerData = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
  totalOrders: number;
  totalBookings: number;
  totalTrips: number;
  totalTickets: number;
  totalCelebrations: number;
  lastActive: string;
  activities: {
    type: string;
    title: string;
    date: string;
    amount: number;
    link: string;
  }[];
};

export default function AdminCustomersPage() {
  const orders = useOrderStore((state) => state.orders);
  const bookings = useBookingStore((state) => state.bookings);
  const trips = useTripStore((state) => state.trips);
  const tickets = useEventStore((state) => state.tickets);
  const celebrations = useCelebrationStore((state) => state.bookings);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    useOrderStore.persist.rehydrate();
    useBookingStore.persist.rehydrate();
    useTripStore.persist.rehydrate();
    useEventStore.persist.rehydrate();
    useCelebrationStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Combine all data into unique customers
  const customers = useMemo(() => {
    if (!mounted) return [];
    
    const customerMap = new Map<string, CustomerData>();

    const getCustomer = (name: string, phone: string, email?: string) => {
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          id: phone,
          name,
          phone,
          email,
          totalSpent: 0,
          totalOrders: 0,
          totalBookings: 0,
          totalTrips: 0,
          totalTickets: 0,
          totalCelebrations: 0,
          lastActive: new Date(0).toISOString(),
          activities: [],
        });
      }
      return customerMap.get(phone)!;
    };

    const updateLastActive = (c: CustomerData, dateStr: string) => {
      if (new Date(dateStr) > new Date(c.lastActive)) {
        c.lastActive = dateStr;
      }
    };

    // 1. Process Orders
    orders.forEach((o) => {
      const c = getCustomer(o.customer.name, o.customer.phone);
      c.totalOrders += 1;
      if (o.status !== "cancelled") c.totalSpent += o.total;
      updateLastActive(c, o.createdAt);
      c.activities.push({
        type: "Food Order",
        title: `Order #${o.id}`,
        date: o.createdAt,
        amount: o.total,
        link: `/order-success/${o.id}`,
      });
    });

    // 2. Process Bookings
    bookings.forEach((b) => {
      const c = getCustomer(b.customer.name, b.customer.phone, b.customer.email);
      c.totalBookings += 1;
      if (b.status !== "cancelled") c.totalSpent += b.advancePaid;
      updateLastActive(c, b.createdAt);
      c.activities.push({
        type: "Table Booking",
        title: `Table for ${b.guests} guests`,
        date: b.createdAt,
        amount: b.advancePaid,
        link: `/table-booking/${b.id}`,
      });
    });

    // 3. Process Trips
    trips.forEach((t) => {
      const c = getCustomer(t.customer.name, t.customer.phone, t.customer.email);
      c.totalTrips += 1;
      if (t.status !== "cancelled") c.totalSpent += t.serviceCharges;
      updateLastActive(c, t.createdAt);
      c.activities.push({
        type: "Pick & Drop",
        title: `Trip to ${t.returnLocation}`,
        date: t.createdAt,
        amount: t.serviceCharges,
        link: `/my-trips/${t.id}`,
      });
    });

    // 4. Process Tickets
    tickets.forEach((t) => {
      const c = getCustomer(t.customer.name, t.customer.phone, t.customer.email);
      c.totalTickets += 1;
      if (t.status !== "cancelled") c.totalSpent += t.advancePaid;
      updateLastActive(c, t.createdAt);
      c.activities.push({
        type: "Event Ticket",
        title: `${t.eventName} (${t.chairNumbers.length} seats)`,
        date: t.createdAt,
        amount: t.advancePaid,
        link: `/my-tickets/${t.id}`,
      });
    });

    // 5. Process Celebrations
    celebrations.forEach((c) => {
      const cust = getCustomer(c.customer.name, c.customer.phone, c.customer.email);
      cust.totalCelebrations += 1;
      if (c.status !== "cancelled") cust.totalSpent += c.advancePaid;
      updateLastActive(cust, c.createdAt);
      cust.activities.push({
        type: "Celebration",
        title: `${c.occasion} for ${c.celebrantName}`,
        date: c.createdAt,
        amount: c.advancePaid,
        link: `/celebration-success/${c.id}`,
      });
    });

    const arr = Array.from(customerMap.values());
    arr.forEach(c => {
      c.activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return arr.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [mounted, orders, bookings, trips, tickets, celebrations]);

  // Search Filter
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  // Stats
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.totalSpent >= 2000).length;

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading customers...</div>;
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
          Customer Management
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
          Customers
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">
          View all customer profiles, history, and activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total Customers
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{customers.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total Revenue
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalSpent.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              VIP Customers
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{vipCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Spent &gt; ₹2000</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Customers List - Responsive Layout */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-3">Total Activity</div>
            <div className="col-span-2 text-right">Total Spent / Action</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((cust) => (
              <div key={cust.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-5 items-center hover:bg-slate-50/50 transition-colors">
                
                {/* Customer Info */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E56000] text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                    {cust.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{cust.name}</div>
                    <div className="text-xs text-slate-500 md:hidden">{cust.phone}</div>
                  </div>
                </div>

                {/* Contact (Desktop Only) */}
                <div className="hidden md:block md:col-span-3">
                  <div className="text-sm font-semibold text-slate-700">{cust.phone}</div>
                  <div className="text-xs text-slate-500 truncate">{cust.email || "No email"}</div>
                </div>

                {/* Activity Badges */}
                <div className="md:col-span-3 flex flex-wrap gap-1 mt-1 md:mt-0">
                  {cust.totalOrders > 0 && <span className="text-[9px] md:text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{cust.totalOrders} Orders</span>}
                  {cust.totalBookings > 0 && <span className="text-[9px] md:text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{cust.totalBookings} Bookings</span>}
                  {cust.totalTrips > 0 && <span className="text-[9px] md:text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">{cust.totalTrips} Trips</span>}
                  {cust.totalTickets > 0 && <span className="text-[9px] md:text-[10px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">{cust.totalTickets} Tickets</span>}
                  {cust.totalCelebrations > 0 && <span className="text-[9px] md:text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{cust.totalCelebrations} Events</span>}
                  
                  {cust.totalOrders === 0 && cust.totalBookings === 0 && cust.totalTrips === 0 && cust.totalTickets === 0 && cust.totalCelebrations === 0 && (
                    <span className="text-xs text-slate-400">No activity</span>
                  )}
                </div>

                {/* Spent & Action */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 md:border-0">
                  <div className="text-base md:text-lg font-black text-[#FF6B00]">
                    ₹{cust.totalSpent.toLocaleString("en-IN")}
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(cust)}
                    className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-600 hover:text-[#FF6B00] bg-slate-100 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ CUSTOMER DETAIL MODAL ============ */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E56000] text-white flex items-center justify-center font-black text-lg md:text-xl shadow-lg flex-shrink-0">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 truncate">{selectedCustomer.name}</h2>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-[10px] md:text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedCustomer.phone}</span>
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {selectedCustomer.email}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100">
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Spent</div>
                  <div className="text-xl md:text-2xl font-black text-[#FF6B00]">₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100">
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Last Active</div>
                  <div className="text-xs md:text-sm font-bold text-slate-900 mt-1">
                    {new Date(selectedCustomer.lastActive).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <h3 className="text-xs font-bold text-slate-900 mb-4 tracking-widest uppercase">
                Activity History
              </h3>
              {selectedCustomer.activities.length === 0 ? (
                <p className="text-slate-500 text-sm">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCustomer.activities.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 md:p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          {act.type === "Food Order" && <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />}
                          {act.type === "Table Booking" && <CalendarDays className="w-4 h-4 text-[#FF6B00]" />}
                          {act.type === "Pick & Drop" && <Car className="w-4 h-4 text-[#FF6B00]" />}
                          {act.type === "Event Ticket" && <Ticket className="w-4 h-4 text-[#FF6B00]" />}
                          {act.type === "Celebration" && <Cake className="w-4 h-4 text-[#FF6B00]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm font-bold text-slate-900 truncate">{act.type}</div>
                          <div className="text-[10px] md:text-xs text-slate-500 truncate">{act.title}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs md:text-sm font-bold text-slate-900">₹{act.amount}</div>
                        <div className="text-[9px] md:text-[10px] text-slate-500">
                          {new Date(act.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}