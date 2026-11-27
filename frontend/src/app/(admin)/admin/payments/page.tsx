"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  X,
  Receipt,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useBookingStore } from "@/store/bookingStore";
import { useTripStore } from "@/store/tripStore";
import { useEventStore } from "@/store/eventStore";
import { useCelebrationStore } from "@/store/celebrationStore";

type Transaction = {
  id: string;
  referenceId: string;
  customerName: string;
  customerPhone: string;
  type: string;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  method: "online" | "cod" | "at-venue";
  paymentStatus: "paid" | "pending" | "refunded";
  advanceStatus: "paid" | "pending" | "n/a";
  refundStatus: "none" | "requested" | "processed";
  date: string;
};

type Tab = "all" | "paid" | "pending" | "refunded";

export default function AdminPaymentsPage() {
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
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchBookings();
    fetchTrips();
    fetchTickets();
    fetchCelebrations();
    setMounted(true);
  }, [fetchOrders, fetchBookings, fetchTrips, fetchTickets, fetchCelebrations]);

  const allTransactions = useMemo(() => {
    if (!mounted) return [];
    const txs: Transaction[] = [];

    orders.forEach((o) => {
      const isPaid = o.paymentStatus === "paid" || o.paymentMethod === "online";
      const isRefunded = o.status === "cancelled" && isPaid;
      txs.push({
        id: `TXN-ORD-${o.id.slice(-6)}`,
        referenceId: o.id,
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        type: "Food Order",
        totalAmount: o.total,
        advancePaid: isPaid ? o.total : 0,
        remainingAmount: isPaid ? 0 : o.total,
        method: o.paymentMethod === "cod" ? "cod" : "online",
        paymentStatus: isRefunded ? "refunded" : isPaid ? "paid" : "pending",
        advanceStatus: isPaid ? "paid" : "pending",
        refundStatus: isRefunded ? "processed" : "none",
        date: o.createdAt,
      });
    });

    bookings.forEach((b) => {
      const isAdvancePaid = b.paymentStatus === "paid";
      const isRefunded = b.status === "cancelled" && isAdvancePaid;
      txs.push({
        id: `TXN-BKG-${b.id.slice(-6)}`,
        referenceId: b.id,
        customerName: b.customer.name,
        customerPhone: b.customer.phone,
        type: "Table Booking",
        totalAmount: b.advancePaid,
        advancePaid: b.advancePaid,
        remainingAmount: 0,
        method: b.paymentMethod === "cod" ? "at-venue" : "online",
        paymentStatus: isRefunded ? "refunded" : isAdvancePaid ? "paid" : "pending",
        advanceStatus: isAdvancePaid ? "paid" : "pending",
        refundStatus: isRefunded ? "processed" : "none",
        date: b.createdAt,
      });
    });

    trips.forEach((t) => {
      const isPaid = t.paymentStatus === "paid";
      const isRefunded = t.status === "cancelled" && isPaid;
      txs.push({
        id: `TXN-TRP-${t.id.slice(-6)}`,
        referenceId: t.id,
        customerName: t.customer.name,
        customerPhone: t.customer.phone,
        type: "Pick & Drop",
        totalAmount: t.serviceCharges || 0,
        advancePaid: isPaid ? (t.serviceCharges || 0) : 0,
        remainingAmount: isPaid ? 0 : (t.serviceCharges || 0),
        method: t.paymentMethod === "cod" ? "at-venue" : "online",
        paymentStatus: isRefunded ? "refunded" : isPaid ? "paid" : "pending",
        advanceStatus: isPaid ? "paid" : "pending",
        refundStatus: isRefunded ? "processed" : "none",
        date: t.createdAt,
      });
    });

    tickets.forEach((t) => {
      const isAdvancePaid = t.paymentStatus === "paid";
      const isRefunded = t.status === "cancelled" && isAdvancePaid;
      txs.push({
        id: `TXN-TKT-${t.id.slice(-6)}`,
        referenceId: t.id,
        customerName: t.customer.name,
        customerPhone: t.customer.phone,
        type: "Concert Booking",
        totalAmount: t.totalPrice || t.advancePaid,
        advancePaid: t.advancePaid,
        remainingAmount: (t.totalPrice || t.advancePaid) - t.advancePaid,
        method: t.paymentMethod === "cod" ? "at-venue" : "online",
        paymentStatus: isRefunded ? "refunded" : isAdvancePaid ? "paid" : "pending",
        advanceStatus: isAdvancePaid ? "paid" : "pending",
        refundStatus: isRefunded ? "processed" : "none",
        date: t.createdAt,
      });
    });

    celebrations.forEach((c) => {
      const isAdvancePaid = c.paymentStatus === "paid";
      const isRefunded = c.status === "cancelled" && isAdvancePaid;
      txs.push({
        id: `TXN-CEL-${c.id.slice(-6)}`,
        referenceId: c.id,
        customerName: c.customer.name,
        customerPhone: c.customer.phone,
        type: "Special Occasion",
        totalAmount: c.totalPrice,
        advancePaid: c.advancePaid,
        remainingAmount: c.totalPrice - c.advancePaid,
        method: c.paymentMethod === "cod" ? "at-venue" : "online",
        paymentStatus: isRefunded ? "refunded" : isAdvancePaid ? "paid" : "pending",
        advanceStatus: isAdvancePaid ? "paid" : "pending",
        refundStatus: isRefunded ? "processed" : "none",
        date: c.createdAt,
      });
    });

    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [mounted, orders, bookings, trips, tickets, celebrations]);

  const totalCollected = allTransactions.reduce((s, t) => s + (t.paymentStatus === "paid" || t.paymentStatus === "refunded" ? t.advancePaid : 0), 0);
  const totalPending = allTransactions.filter(t => t.paymentStatus === "pending").reduce((s, t) => s + t.remainingAmount, 0);
  const totalRefunded = allTransactions.filter(t => t.refundStatus === "processed").reduce((s, t) => s + t.advancePaid, 0);

  let filtered = allTransactions;
  if (activeTab !== "all") {
    filtered = filtered.filter(t => t.paymentStatus === activeTab);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.referenceId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q)
    );
  }

  const getMethodIcon = (method: string) => {
    if (method === "online") return <CreditCard className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    if (method === "cod") return <Banknote className="w-4 h-4 text-green-600 flex-shrink-0" />;
    return <Banknote className="w-4 h-4 text-amber-600 flex-shrink-0" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid") return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
    if (status === "pending") return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> Pending</span>;
    return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><XCircle className="w-3 h-3" /> Refunded</span>;
  };

  const getRefundBadge = (status: string) => {
    if (status === "processed") return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><RotateCcw className="w-3 h-3" /> Processed</span>;
    if (status === "requested") return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> Requested</span>;
    return <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">None</span>;
  };

  if (!mounted) return <div className="text-slate-500 p-4">Loading payments...</div>;

  return (
    <div className="pb-10">
      <div className="mb-6 md:mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Financials</span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">Payment Management</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">Track all transactions, advance payments, and refunds.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0"><IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Collected</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">₹{totalCollected.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Pending</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">₹{totalPending.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Refunded</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">₹{totalRefunded.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Wallet className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Transactions</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{allTransactions.length}</div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 w-full xl:w-auto">
          {([{ key: "all", label: "All", count: allTransactions.length }, { key: "paid", label: "Paid", count: allTransactions.filter(t => t.paymentStatus === "paid").length }, { key: "pending", label: "Pending", count: allTransactions.filter(t => t.paymentStatus === "pending").length }, { key: "refunded", label: "Refunded", count: allTransactions.filter(t => t.paymentStatus === "refunded").length }] as { key: Tab; label: string; count: number }[]).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"}`}>
              {tab.label}
              <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full xl:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by ID, Name, Phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] outline-none transition-all shadow-sm text-sm md:text-base" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No transactions found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-2">Transaction</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Type / Method</div>
            <div className="col-span-2">Amount (Total / Adv)</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Refund</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((tx) => (
              <div key={tx.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 md:px-5 items-center hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedTx(tx)}>
                <div className="md:col-span-2 flex items-center justify-between md:block">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Txn ID</span>
                  <div className="text-right md:text-left">
                    <div className="font-mono text-xs font-bold text-slate-900">{tx.id}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:block">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Customer</span>
                  <div className="text-right md:text-left min-w-0">
                    <div className="font-bold text-sm text-slate-900 truncate">{tx.customerName}</div>
                    <div className="text-xs text-slate-500">{tx.customerPhone}</div>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:block">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Type</span>
                  <div className="text-right md:text-left">
                    <div className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md w-fit mb-1 ml-auto md:ml-0">{tx.type}</div>
                    <div className="flex items-center justify-end md:justify-start gap-1.5 text-[10px] md:text-[11px] font-semibold text-slate-500 capitalize">{getMethodIcon(tx.method)} <span className="truncate">{tx.method === "at-venue" ? "At Venue" : tx.method}</span></div>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:block mt-1 md:mt-0 pt-2 md:pt-0 border-t border-slate-50 md:border-0">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Amount</span>
                  <div className="text-right md:text-left">
                    <div className="font-black text-slate-900 text-sm">₹{tx.totalAmount.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] md:text-[11px] font-bold text-green-600 mt-0.5">Adv: ₹{tx.advancePaid.toLocaleString("en-IN")}</div>
                    {tx.remainingAmount > 0 && <div className="text-[9px] md:text-[10px] font-semibold text-amber-600">Due: ₹{tx.remainingAmount.toLocaleString("en-IN")}</div>}
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:block">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Status</span>
                  <div className="text-right md:text-left">
                    {getStatusBadge(tx.paymentStatus)}
                    <div className="text-[9px] md:text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Adv: {tx.advanceStatus}</div>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:block">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Refund</span>
                  <div className="text-right md:text-left">{getRefundBadge(tx.refundStatus)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedTx(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 p-5 md:p-6 text-center relative">
              <button onClick={() => setSelectedTx(null)} className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 border border-white/20"><Receipt className="w-6 h-6 md:w-8 md:h-8 text-white" /></div>
              <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Transaction ID</div>
              <div className="font-mono text-base md:text-lg font-black text-white">{selectedTx.id}</div>
            </div>
            <div className="p-5 md:p-6">
              <div className="text-center mb-5 md:mb-6">
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Amount</div>
                <div className="text-3xl md:text-4xl font-black text-[#FF6B00]">₹{selectedTx.totalAmount.toLocaleString("en-IN")}</div>
                <div className="mt-2 md:mt-3 flex flex-wrap items-center justify-center gap-2">
                  {getStatusBadge(selectedTx.paymentStatus)}
                  {getRefundBadge(selectedTx.refundStatus)}
                </div>
              </div>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm border-t border-slate-100 pt-4 md:pt-5">
                <div className="flex justify-between gap-2"><span className="text-slate-500">Customer</span><span className="font-bold text-slate-900 text-right truncate">{selectedTx.customerName}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500">Phone</span><span className="font-bold text-slate-900">{selectedTx.customerPhone}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500">Reference ID</span><span className="font-mono font-bold text-slate-900">{selectedTx.referenceId}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500">Type</span><span className="font-bold text-slate-900">{selectedTx.type}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500">Method</span><span className="font-bold text-slate-900 capitalize">{selectedTx.method === "at-venue" ? "At Venue" : selectedTx.method}</span></div>
                <div className="pt-2 md:pt-3 mt-2 md:mt-3 border-t border-slate-100">
                  <div className="flex justify-between mb-1"><span className="text-slate-500">Advance Paid</span><span className="font-bold text-green-600">₹{selectedTx.advancePaid.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Remaining Due</span><span className="font-bold text-amber-600">₹{selectedTx.remainingAmount.toLocaleString("en-IN")}</span></div>
                </div>
                <div className="flex justify-between pt-2 md:pt-3 border-t border-slate-100"><span className="text-slate-500">Date</span><span className="font-bold text-slate-900 text-right">{new Date(selectedTx.date).toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}