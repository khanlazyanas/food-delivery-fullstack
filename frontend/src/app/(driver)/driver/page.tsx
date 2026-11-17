"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Power,
  MapPin,
  Phone,
  IndianRupee,
  ShoppingBag,
  Car,
  Clock,
  ChevronRight,
  LogOut,
  Navigation,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useTripStore } from "@/store/tripStore";

export default function DriverDashboardPage() {
  const router = useRouter();
  const orders = useOrderStore((state) => state.orders);
  const trips = useTripStore((state) => state.trips);

  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    // Simple auth check for demo
    const auth = localStorage.getItem("driver-auth");
    if (auth !== "true") {
      router.push("/driver/login");
      return;
    }
    
    useOrderStore.persist.rehydrate();
    useTripStore.persist.rehydrate();
    setMounted(true);
  }, [router]);

  if (!mounted) return <div className="p-6 text-center text-slate-500">Loading...</div>;

  const activeOrders = orders.filter(
    (o) => 
      o.orderType === "delivery" && 
      ["placed", "driver-assigned", "out-for-delivery", "picked-up", "ready"].includes(o.status)
  );

  const activeTrips = trips.filter(
    (t) => ["requested", "driver-assigned", "driver-en-route"].includes(t.status)
  );

  const historyOrders = orders.filter((o) => o.status === "delivered");
  const historyTrips = trips.filter((t) => t.status === "completed");

  const totalActive = activeOrders.length + activeTrips.length;

  const handleLogout = () => {
    localStorage.removeItem("driver-auth");
    router.push("/driver/login");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-screen overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Hello, Driver</h1>
            <p className="text-slate-400 text-sm mt-0.5">Ready for today&apos;s trips?</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Online Toggle */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOnline ? "bg-green-500" : "bg-slate-600"}`}>
              <Power className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">{isOnline ? "You are Online" : "You are Offline"}</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                {isOnline ? "Receiving new jobs" : "Go online to get jobs"}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isOnline ? "bg-green-500" : "bg-slate-600"}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOnline ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active Jobs ({totalActive})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-4">
        {!isOnline && activeTab === "active" ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
            <Power className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">You are Offline</h3>
            <p className="text-sm text-slate-500 mt-1">Go online to see new assigned jobs.</p>
          </div>
        ) : activeTab === "active" ? (
          <>
            {/* Render Active Trips */}
            {activeTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/driver/job/${trip.id}?type=trip`}
                className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-orange-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3 h-3" /> Pick & Drop
                    </span>
                    <span className="text-xs font-bold text-slate-400">{trip.id}</span>
                  </div>
                  <span className="text-xs font-bold text-[#FF6B00] bg-orange-50 px-2 py-1 rounded-md">
                    ₹{trip.serviceCharges}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><MapPin className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">{trip.pickupLocation}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Navigation className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Drop Location</div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">{trip.returnLocation}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <div className="text-sm text-slate-500">Click to view details</div>
                  <ChevronRight className="w-5 h-5 text-orange-500" />
                </div>
              </Link>
            ))}

            {/* Render Active Orders */}
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                href={`/driver/job/${order.id}?type=order`}
                className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-orange-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-[#FF6B00] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> Food Delivery
                    </span>
                    <span className="text-xs font-bold text-slate-400">{order.id}</span>
                  </div>
                  {order.paymentMethod === "cod" ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" /> Collect ₹{order.total}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md uppercase">Prepaid</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><ShoppingBag className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Pickup From</div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">FoodieHub Restaurant</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Navigation className="w-4 h-4 text-green-500" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Deliver To ({order.customer.name})</div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">
                        {order.customer.address}, {order.customer.city}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                    <Phone className="w-3.5 h-3.5" /> {order.customer.phone}
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-500" />
                </div>
              </Link>
            ))}

            {activeOrders.length === 0 && activeTrips.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No active jobs</h3>
                <p className="text-sm text-slate-500 mt-1">You will be notified when a new job is assigned.</p>
              </div>
            )}
          </>
        ) : (
          /* History Tab */
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Completed Jobs</h3>
            {historyOrders.map(o => (
               <div key={o.id} className="bg-white rounded-xl p-4 border border-slate-100 flex justify-between items-center opacity-70">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{o.customer.name}</div>
                    <div className="text-xs text-slate-500">{o.id}</div>
                  </div>
                  <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">Delivered</div>
               </div>
            ))}
            {historyTrips.map(t => (
               <div key={t.id} className="bg-white rounded-xl p-4 border border-slate-100 flex justify-between items-center opacity-70">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.customer.name}</div>
                    <div className="text-xs text-slate-500">{t.id}</div>
                  </div>
                  <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">Completed</div>
               </div>
            ))}
            {historyOrders.length === 0 && historyTrips.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">No history found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}