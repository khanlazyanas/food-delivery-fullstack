"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Star,
  Home,
  Briefcase,
  Package,
  ArrowRight,
  Calendar,
  Ticket,
  Car,
  Cake,
  Bell,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore, Address } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import AddressForm from "@/components/profile/AddressForm";
import EditProfileModal from "@/components/profile/EditProfileModal";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addresses = useAddressStore((state) => state.addresses);
  const removeAddress = useAddressStore((state) => state.removeAddress);
  const setDefault = useAddressStore((state) => state.setDefault);
  const orders = useOrderStore((state) => state.orders);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useAddressStore.persist.rehydrate();
    useOrderStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  const handleDelete = (id: string) => {
    removeAddress(id);
    toast.success("Address removed");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  const getLabelIcon = (label: Address["label"]) => {
    switch (label) {
      case "Home":
        return Home;
      case "Work":
        return Briefcase;
      default:
        return MapPin;
    }
  };

  // PRD Quick Links (Booking history, tickets, rides, occasions)
  const quickLinks = [
    {
      href: "/orders",
      icon: Package,
      label: "My Orders",
      desc: "Order history & tracking",
      count: orders.length,
      color: "from-blue-500 to-blue-600",
    },
    {
      href: "/table-booking",
      icon: Calendar,
      label: "Table Bookings",
      desc: "Your reservations",
      count: 0,
      color: "from-purple-500 to-purple-600",
    },
    {
      href: "/events",
      icon: Ticket,
      label: "Concert Tickets",
      desc: "Event & concert tickets",
      count: 0,
      color: "from-pink-500 to-pink-600",
    },
    {
      href: "/pick-drop",
      icon: Car,
      label: "Pick & Drop",
      desc: "Your ride history",
      count: 0,
      color: "from-teal-500 to-teal-600",
    },
    {
      href: "/celebrations",
      icon: Cake,
      label: "Celebrations",
      desc: "Birthday & anniversary bookings",
      count: 0,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
                Your Account
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
                My Profile
              </h1>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* ================= USER CARD + QUICK LINKS GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: User Card */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm overflow-hidden">
                
                {/* Avatar Header */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] text-white rounded-full flex items-center justify-center text-4xl font-black shadow-lg shadow-orange-500/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
                      aria-label="Edit profile"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight mt-4">
                    {user.name}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Customer
                  </p>
                </div>

                {/* Info Items */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Phone className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Phone
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        +91 {user.phone}
                      </div>
                    </div>
                  </div>

                  {user.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <Mail className="w-4 h-4 text-[#FF6B00]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Email
                        </div>
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.dateOfBirth && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#FF6B00]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Date of Birth
                        </div>
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {new Date(user.dateOfBirth).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] rounded-3xl p-6 text-white shadow-lg shadow-orange-500/30">
                <div className="text-xs font-bold uppercase tracking-widest opacity-90 mb-1">
                  Saved Addresses
                </div>
                <div className="text-4xl font-black mb-1">
                  {addresses.length}
                </div>
                <div className="text-sm opacity-90">
                  {addresses.length === 0
                    ? "Add your first address"
                    : "Ready for faster checkout"}
                </div>
              </div>
            </div>

            {/* RIGHT: Quick Links Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    My Activity
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Quick access to all your history and bookings
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md transition-all"
                      >
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${link.color} text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-sm group-hover:text-[#FF6B00] transition-colors">
                            {link.label}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {link.desc}
                          </div>
                        </div>
                        {link.count > 0 && (
                          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            {link.count}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>

                {/* Notifications & Settings */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                    Preferences
                  </h3>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                          <Bell className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm text-slate-900">
                            Notifications
                          </div>
                          <div className="text-xs text-slate-500">
                            Order updates, offers & more
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SAVED ADDRESSES ================= */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Saved Addresses
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {addresses.length} address
                  {addresses.length !== 1 ? "es" : ""} saved
                </p>
              </div>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-orange-500/30"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {/* Empty State */}
            {addresses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No addresses yet
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Add an address for faster checkout
                </p>
                <button
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg shadow-orange-500/30"
                >
                  <Plus className="w-4 h-4" /> Add First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const LabelIcon = getLabelIcon(addr.label);
                  return (
                    <div
                      key={addr.id}
                      className={`relative p-5 rounded-2xl border-2 transition-all ${
                        addr.isDefault
                          ? "border-orange-200 bg-orange-50/40"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      {addr.isDefault && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#FF6B00] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-white" /> Default
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <LabelIcon className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {addr.label}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="font-bold text-slate-900 mb-1">
                          {addr.fullName}
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed">
                          {addr.address}, {addr.city} — {addr.pincode}
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => {
                              setDefault(addr.id);
                              toast.success("Set as default");
                            }}
                            className="text-xs font-bold text-[#FF6B00] hover:underline"
                          >
                            Set as default
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">
                            Primary address
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditing(addr);
                              setShowForm(true);
                            }}
                            className="p-2 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors"
                            aria-label="Edit address"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showForm && (
        <AddressForm
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          editing={editing}
        />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
}