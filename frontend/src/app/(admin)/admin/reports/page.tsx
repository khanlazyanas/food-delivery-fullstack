"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Users,
  CalendarDays,
  Truck,
  Ticket,
  CreditCard,
  RotateCcw,
  ChefHat,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useOrderStore } from "@/store/orderStore";
import { useBookingStore } from "@/store/bookingStore";
import { useTripStore } from "@/store/tripStore";
import { useEventStore } from "@/store/eventStore";
import { useCelebrationStore } from "@/store/celebrationStore";

const COLORS = ["#FF6B00", "#3D1C00", "#FFB27D", "#A0522D", "#E56000"];

type Tab = "sales" | "orders" | "bookings" | "events" | "delivery" | "customers";

export default function AdminReportsPage() {
  const orders = useOrderStore((state) => state.orders);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);

  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);

  const trips = useTripStore((state) => state.trips);
  const fetchTrips = useTripStore((state) => state.fetchTrips);

  const tickets = useEventStore((state) => state.tickets);
  const fetchTickets = useEventStore((state) => state.fetchTickets);

  const celebrations = useCelebrationStore((state) => state.bookings);
  const fetchCelebrations = useCelebrationStore((state) => state.fetchBookings);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sales");

  useEffect(() => {
    fetchOrders();
    fetchBookings();
    fetchTrips();
    fetchTickets();
    fetchCelebrations();
    setMounted(true);
  }, [fetchOrders, fetchBookings, fetchTrips, fetchTickets, fetchCelebrations]);

  const data = useMemo(() => {
    if (!mounted) return null;

    let totalRevenue = 0;
    let totalPending = 0;
    let totalRefunded = 0;
    let onlineCount = 0;
    let codCount = 0;
    const uniqueCustomers = new Set<string>();
    
    const dateMap: Record<string, { date: string; revenue: number; orders: number }> = {};

    orders.forEach(o => {
      if (o.status !== "cancelled") {
        totalRevenue += o.total;
        if (o.paymentStatus === "pending") totalPending += o.total;
        if (o.paymentStatus === "refunded") totalRefunded += o.total;
        if (o.paymentMethod === "online") onlineCount++;
        else codCount++;
      }
      uniqueCustomers.add(o.customer.phone);
      const d = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (!dateMap[d]) dateMap[d] = { date: d, revenue: 0, orders: 0 };
      if (o.status !== "cancelled") dateMap[d].revenue += o.total;
      dateMap[d].orders += 1;
    });

    bookings.forEach(b => {
      if (b.status !== "cancelled") {
        totalRevenue += b.advancePaid;
        if (b.paymentStatus === "pending") totalPending += b.advancePaid;
        if (b.paymentStatus === "refunded") totalRefunded += b.advancePaid;
        if (b.paymentMethod === "online") onlineCount++;
        else codCount++;
      }
      uniqueCustomers.add(b.customer.phone);
    });

    tickets.forEach(t => {
      if (t.status !== "cancelled") {
        totalRevenue += t.advancePaid;
        if (t.paymentStatus === "pending") totalPending += (t.totalPrice - t.advancePaid);
        if (t.paymentStatus === "refunded") totalRefunded += t.advancePaid;
        if (t.paymentMethod === "online") onlineCount++;
        else codCount++;
      }
      uniqueCustomers.add(t.customer.phone);
    });

    trips.forEach(t => {
      if (t.status !== "cancelled") {
        totalRevenue += t.serviceCharges;
        if (t.paymentStatus === "pending") totalPending += t.serviceCharges;
        if (t.paymentStatus === "refunded") totalRefunded += t.serviceCharges;
        if (t.paymentMethod === "online") onlineCount++;
        else codCount++;
      }
      uniqueCustomers.add(t.customer.phone);
    });

    celebrations.forEach(c => {
      if (c.status !== "cancelled") {
        totalRevenue += c.advancePaid;
        if (c.paymentStatus === "pending") totalPending += (c.totalPrice - c.advancePaid);
        if (c.paymentStatus === "refunded") totalRefunded += c.advancePaid;
        if (c.paymentMethod === "online") onlineCount++;
        else codCount++;
      }
      uniqueCustomers.add(c.customer.phone);
    });

    const revenueChartData = Object.values(dateMap).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      if (o.status !== "cancelled") {
        o.items.forEach(i => {
          if (!itemMap[i.name]) itemMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
          itemMap[i.name].qty += i.quantity;
          itemMap[i.name].revenue += (i.finalPrice * i.quantity);
        });
      }
    });
    const topItems = Object.values(itemMap).sort((a,b) => b.qty - a.qty).slice(0, 5);

    const customerMap: Record<string, { name: string; phone: string; spend: number; orders: number }> = {};
    orders.forEach(o => {
      if (!customerMap[o.customer.phone]) customerMap[o.customer.phone] = { name: o.customer.name, phone: o.customer.phone, spend: 0, orders: 0 };
      customerMap[o.customer.phone].spend += o.total;
      customerMap[o.customer.phone].orders += 1;
    });
    const topCustomers = Object.values(customerMap).sort((a,b) => b.spend - a.spend).slice(0, 5);

    return {
      sales: { totalRevenue, totalPending, totalRefunded, onlineCount, codCount, revenueChartData },
      orders: { total: orders.length, topItems },
      bookings: { 
        tables: bookings.length, 
        celebrations: celebrations.length,
        revenue: bookings.reduce((s,b) => s + (b.status !== "cancelled" ? b.advancePaid : 0), 0) + 
                 celebrations.reduce((s,c) => s + (c.status !== "cancelled" ? c.advancePaid : 0), 0)
      },
      events: { tickets: tickets.length, revenue: tickets.reduce((s,t) => s + (t.status !== "cancelled" ? t.advancePaid : 0), 0) },
      delivery: { trips: trips.length, revenue: trips.reduce((s,t) => s + (t.status !== "cancelled" ? t.serviceCharges : 0), 0) },
      customers: { unique: uniqueCustomers.size, topCustomers }
    };
  }, [mounted, orders, bookings, tickets, trips, celebrations]);

  if (!mounted || !data) return <div className="text-slate-500 p-4">Loading reports...</div>;

  const tabs = [
    { id: "sales", label: "Sales", icon: CreditCard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "events", label: "Events", icon: Ticket },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "customers", label: "Customers", icon: Users },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Analytics</span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">Reports & Insights</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Track performance across all modules</p>
        </div>
        <button className="flex items-center justify-center w-full md:w-auto gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${isActive ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30" : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300"}`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* SALES TAB */}
      {activeTab === "sales" && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <KpiCard icon={IndianRupee} label="Collected" value={`₹${data.sales.totalRevenue.toLocaleString("en-IN")}`} color="green" />
            <KpiCard icon={TrendingUp} label="Pending COD" value={`₹${data.sales.totalPending.toLocaleString("en-IN")}`} color="orange" />
            <KpiCard icon={RotateCcw} label="Refunded" value={`₹${data.sales.totalRefunded.toLocaleString("en-IN")}`} color="red" />
            <KpiCard icon={CreditCard} label="Online Txns" value={`${data.sales.onlineCount}`} color="blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
              <h2 className="text-base md:text-lg font-black text-slate-900 mb-4 md:mb-6">Revenue Trend</h2>
              <div className="h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.sales.revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} width={45} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
              <h2 className="text-base md:text-lg font-black text-slate-900 mb-4 md:mb-6">Payment Methods</h2>
              <div className="h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Online', value: data.sales.onlineCount }, { name: 'COD', value: data.sales.codCount }]} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      <Cell fill="#FF6B00" />
                      <Cell fill="#3D1C00" />
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <KpiCard icon={ShoppingBag} label="Total Orders" value={data.orders.total} color="orange" />
          </div>
          
          <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
            <h2 className="text-base md:text-lg font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2"><ChefHat className="w-5 h-5 text-orange-500"/> Top Selling Items</h2>
            <div className="space-y-3 md:space-y-4">
              {data.orders.topItems.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-2">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0">#{i+1}</div>
                    <div className="min-w-0"><div className="font-bold text-slate-900 text-sm md:text-base truncate">{item.name}</div><div className="text-[10px] md:text-xs text-slate-500">{item.qty} orders</div></div>
                  </div>
                  <div className="font-black text-slate-900 text-sm md:text-base flex-shrink-0">₹{item.revenue.toLocaleString("en-IN")}</div>
                </div>
              ))}
              {data.orders.topItems.length === 0 && <div className="text-slate-500 text-sm py-4">No orders yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <KpiCard icon={CalendarDays} label="Table Bookings" value={data.bookings.tables} color="blue" />
            <KpiCard icon={Ticket} label="Celebrations" value={data.bookings.celebrations} color="pink" />
            <div className="col-span-2 md:col-span-1"><KpiCard icon={IndianRupee} label="Total Revenue" value={`₹${data.bookings.revenue.toLocaleString("en-IN")}`} color="green" /></div>
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === "events" && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <KpiCard icon={Ticket} label="Tickets Sold" value={data.events.tickets} color="purple" />
            <KpiCard icon={IndianRupee} label="Ticket Revenue" value={`₹${data.events.revenue.toLocaleString("en-IN")}`} color="green" />
          </div>
        </div>
      )}

      {/* DELIVERY TAB */}
      {activeTab === "delivery" && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <KpiCard icon={Truck} label="Total Trips" value={data.delivery.trips} color="orange" />
            <KpiCard icon={IndianRupee} label="Trip Revenue" value={`₹${data.delivery.revenue.toLocaleString("en-IN")}`} color="green" />
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === "customers" && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <KpiCard icon={Users} label="Unique Customers" value={data.customers.unique} color="purple" />
          </div>

          <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
            <h2 className="text-base md:text-lg font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-green-500"/> Top Customers</h2>
            <div className="space-y-2 md:space-y-3">
              {data.customers.topCustomers.map((c, i) => (
                <div key={c.phone} className="flex items-center justify-between p-3 md:p-4 border-b border-slate-50 last:border-0 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 flex-shrink-0 text-sm md:text-base">{c.name.charAt(0)}</div>
                    <div className="min-w-0"><div className="font-bold text-slate-900 text-sm md:text-base truncate">{c.name}</div><div className="text-[10px] md:text-xs text-slate-500">{c.phone}</div></div>
                  </div>
                  <div className="text-right flex-shrink-0"><div className="font-black text-[#FF6B00] text-sm md:text-base">₹{c.spend.toLocaleString("en-IN")}</div><div className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider">{c.orders} orders</div></div>
                </div>
              ))}
              {data.customers.topCustomers.length === 0 && <div className="text-slate-500 text-sm py-4">No customer data yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable KPI Card
function KpiCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: "green" | "orange" | "red" | "blue" | "purple" | "pink" }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-[#FF6B00]",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
  };
  return (
    <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-3">
        <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}><Icon className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">{label}</span>
      </div>
      <div className="text-lg md:text-2xl font-black text-slate-900 truncate">{value}</div>
    </div>
  );
}