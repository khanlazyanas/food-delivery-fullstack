"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  ShoppingBag,
  CalendarDays,
  Car,
  Ticket,
  Tag,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  UserCheck,
  Cake,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useBookingStore } from "@/store/bookingStore";
import { useTripStore } from "@/store/tripStore";
import { useEventStore } from "@/store/eventStore";
import { useCelebrationStore } from "@/store/celebrationStore";
import { useOfferStore } from "@/store/offerStore";
import toast from "react-hot-toast";

type NotificationType =
  | "order"
  | "payment"
  | "driver"
  | "booking"
  | "reminder"
  | "trip"
  | "event"
  | "celebration"
  | "offer";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  link: string;
  isRead: boolean;
};

export default function NotificationsPage() {
  const orders = useOrderStore((state) => state.orders);
  const bookings = useBookingStore((state) => state.bookings);
  const trips = useTripStore((state) => state.trips);
  const tickets = useEventStore((state) => state.tickets);
  const celebrations = useCelebrationStore((state) => state.bookings);
  const offers = useOfferStore((state) => state.offers);

  const [mounted, setMounted] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  // 1. Sirf ek baar rehydrate karo
  useEffect(() => {
    useOrderStore.persist.rehydrate();
    useBookingStore.persist.rehydrate();
    useTripStore.persist.rehydrate();
    useEventStore.persist.rehydrate();
    useCelebrationStore.persist.rehydrate();
    useOfferStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // 2. Notifications ko useMemo se calculate karo (Infinite loop fix)
  const notifications = useMemo(() => {
    if (!mounted) return [];

    const allNotifs: NotificationItem[] = [];

    // Orders
    orders.forEach((o) => {
      allNotifs.push({
        id: `ORD-${o.id}`,
        type: "order",
        title: "Order Status Update",
        message: `Your order ${o.id} is currently ${o.status.replace("-", " ")}.`,
        date: o.updatedAt || o.createdAt,
        link: `/order-success/${o.id}`,
        isRead: false,
      });

      if (o.paymentStatus === "paid") {
        allNotifs.push({
          id: `PAY-${o.id}`,
          type: "payment",
          title: "Payment Successful",
          message: `We received your payment of ₹${o.total} for order ${o.id}.`,
          date: o.createdAt,
          link: `/order-success/${o.id}`,
          isRead: false,
        });
      }

      if (o.driverInfo) {
        allNotifs.push({
          id: `DRV-${o.id}`,
          type: "driver",
          title: "Driver Assigned",
          message: `${o.driverInfo.name} has been assigned to deliver your order.`,
          date: o.updatedAt || o.createdAt,
          link: `/track/order/${o.id}`,
          isRead: false,
        });
      }
    });

    // Table Bookings
    bookings.forEach((b) => {
      allNotifs.push({
        id: `BKG-${b.id}`,
        type: "booking",
        title: "Table Booking Confirmed",
        message: `Your table for ${b.guests} on ${new Date(b.date).toLocaleDateString()} at ${b.time} is ${b.status}.`,
        date: b.createdAt,
        link: `/table-booking/${b.id}`,
        isRead: false,
      });

      const bookingDate = new Date(b.date);
      const today = new Date();
      const diffTime = bookingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 1 && b.status === "confirmed") {
        allNotifs.push({
          id: `REM-${b.id}`,
          type: "reminder",
          title: "Table Reminder",
          message: `Reminder: Your table is booked for tomorrow at ${b.time}.`,
          date: new Date().toISOString(),
          link: `/table-booking/${b.id}`,
          isRead: false,
        });
      }
    });

    // Trips
    trips.forEach((t) => {
      allNotifs.push({
        id: `TRP-${t.id}`,
        type: "trip",
        title: "Pick & Drop Update",
        message: `Your trip to ${t.returnLocation} is ${t.status.replace("-", " ")}.`,
        date: t.updatedAt || t.createdAt,
        link: `/my-trips/${t.id}`,
        isRead: false,
      });
    });

    // Events
    tickets.forEach((t) => {
      allNotifs.push({
        id: `TKT-${t.id}`,
        type: "event",
        title: "Concert Ticket & QR",
        message: `You have booked ${t.chairNumbers.length} seat(s) for ${t.eventName}. Ticket & QR are ready.`,
        date: t.createdAt,
        link: `/my-tickets/${t.id}`,
        isRead: false,
      });
    });

    // Celebrations
    celebrations.forEach((c) => {
      allNotifs.push({
        id: `CEL-${c.id}`,
        type: "celebration",
        title: "Special Occasion Booked",
        message: `Your ${c.occasion} for ${c.celebrantName} is confirmed!`,
        date: c.createdAt,
        link: `/celebration-success/${c.id}`,
        isRead: false,
      });
    });

    // Offers
    const activeOffers = offers.filter((o) => o.isActive !== false);
    if (activeOffers.length > 0) {
      allNotifs.push({
        id: `OFFER-LATEST`,
        type: "offer",
        title: "Weekly Offers Are Live! 🎉",
        message: `${activeOffers.length} new offers available. Check them out before they expire.`,
        date: new Date().toISOString(),
        link: "/offers",
        isRead: false,
      });
    }

    // Sort newest first
    allNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Local read state apply karo
    return allNotifs.map((n) => ({
      ...n,
      isRead: readIds.includes(n.id),
    }));
  }, [mounted, orders, bookings, trips, tickets, celebrations, offers, readIds]);

  const markAllRead = () => {
    setReadIds(notifications.map((n) => n.id));
    toast.success("All marked as read");
  };

  const handleRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "order": return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case "payment": return <CreditCard className="w-5 h-5 text-green-500" />;
      case "driver": return <UserCheck className="w-5 h-5 text-cyan-500" />;
      case "booking": return <CalendarDays className="w-5 h-5 text-purple-500" />;
      case "reminder": return <Clock className="w-5 h-5 text-amber-500" />;
      case "trip": return <Car className="w-5 h-5 text-teal-500" />;
      case "event": return <Ticket className="w-5 h-5 text-pink-500" />;
      case "celebration": return <Cake className="w-5 h-5 text-orange-500" />;
      case "offer": return <Tag className="w-5 h-5 text-green-500" />;
    }
  };

  if (!mounted) {
    return <div className="text-center py-24 text-slate-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                Updates & Alerts
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-3">
                Notifications
                {notifications.some((n) => !n.isRead) && (
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </h1>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="text-sm font-bold text-slate-500 hover:text-[#FF6B00] flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {notifications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications</h3>
              <p className="text-slate-500">
                When you place orders or make bookings, updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => handleRead(notif.id)}
                  className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    notif.isRead
                      ? "bg-white border-slate-100 hover:border-slate-200"
                      : "bg-orange-50/50 border-orange-100 hover:border-orange-200 shadow-sm"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    notif.isRead ? "bg-slate-50" : "bg-white"
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`text-sm font-bold truncate ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${notif.isRead ? "text-slate-500" : "text-slate-600 font-medium"}`}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#FF6B00] transition-colors flex-shrink-0 self-center" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}