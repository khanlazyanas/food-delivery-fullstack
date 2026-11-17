"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  LogOut,
  CalendarDays,
  Grid3x3,
  Music,
  Car,
  Users,
  Tag,
  Cake,
  User,
  CreditCard,
  Layers,
  PieChart,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/offers", label: "Offers", icon: Tag },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/admin/tables", label: "Tables", icon: Grid3x3 },
    { href: "/admin/celebrations", label: "Celebrations", icon: Cake },
    { href: "/admin/events", label: "Events", icon: Music },
    { href: "/admin/trips", label: "Trips", icon: Car },
    { href: "/admin/drivers", label: "Drivers", icon: Users },
    { href: "/admin/customers", label: "Customers", icon: User },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/reports", label: "Reports", icon: PieChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 flex-col md:flex-row">
      
      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">
            Foodie<span className="text-[#FF6B00]">Hub.</span>
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ================= SIDEBAR OVERLAY (Mobile) ================= */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Professional Logo Section */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="items-center gap-3 group hidden md:flex">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight leading-none">
                Foodie<span className="text-[#FF6B00]">Hub.</span>
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                Admin Portal
              </div>
            </div>
          </Link>
          
          {/* Mobile Close Button inside Sidebar */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight">Menu</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)} // Close menu on click (mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#FF6B00] text-white shadow-md shadow-orange-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
        {/* Max width wrapper to prevent overly stretched content on big screens */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}