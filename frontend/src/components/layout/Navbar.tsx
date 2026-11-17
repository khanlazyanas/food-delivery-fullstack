"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  MapPin,
  Package,
  LogOut,
  Tag,
  Menu,
  X,
  ChevronDown,
  Bell,
  UtensilsCrossed, // 👈 Naya Icon import kiya
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { menuItems } from "@/lib/menuData";
import { searchItems } from "@/lib/searchUtils";
import SearchDropdown from "@/components/search/SearchDropdown";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [results, setResults] = useState<typeof menuItems>([]);
  const [mobileResults, setMobileResults] = useState<typeof menuItems>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) {
        setResults(searchItems(query, menuItems));
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Mobile debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (mobileQuery.trim()) {
        setMobileResults(searchItems(mobileQuery, menuItems));
      } else {
        setMobileResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [mobileQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (showMobileMenu || showMobileSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileMenu, showMobileSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileQuery.trim()) return;
    setShowMobileSearch(false);
    setShowMobileMenu(false);
    router.push(`/search?q=${encodeURIComponent(mobileQuery)}`);
    setMobileQuery("");
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    toast.success("Logged out");
    router.push("/");
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
    setMobileQuery("");
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/60"
            : "bg-white/80 backdrop-blur-md border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center gap-3 transition-all duration-300 ${
              scrolled ? "h-16 lg:h-[72px]" : "h-16 lg:h-20"
            }`}
          >
            
            {/* ================= LEFT: Logo + Mobile Menu ================= */}
            <div className="flex items-center gap-2 lg:gap-6 min-w-0">
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* 👇 NAYA PROFESSIONAL LOGO 👇 */}
              <Link
                href="/"
                className="flex items-center gap-2 lg:gap-2.5 flex-shrink-0 group"
              >
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-lg lg:rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <span className="text-xl lg:text-2xl font-black tracking-tight text-slate-900">
                  Foodie<span className="text-[#FF6B00]">Hub.</span>
                </span>
              </Link>
              {/* 👆 NAYA PROFESSIONAL LOGO 👆 */}

              {/* Desktop Location */}
              <button className="hidden lg:flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-100 px-4 py-2 rounded-full transition-all group ml-2">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] rounded-full flex items-center justify-center shadow-sm">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold">
                  Deliver to:{" "}
                  <span className="text-slate-900 font-bold">
                    Current Location
                  </span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </div>

            {/* ================= CENTER: Desktop Search ================= */}
            <div
              ref={searchRef}
              className="hidden lg:flex flex-1 max-w-xl mx-4 relative"
            >
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for dishes, cuisines..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setShowDropdown(true)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-transparent focus:bg-white focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100 rounded-full py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-500 transition-all outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setShowDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              </form>

              {showDropdown && (
                <SearchDropdown
                  query={query}
                  results={results}
                  onClose={() => {
                    setShowDropdown(false);
                    setQuery("");
                  }}
                />
              )}
            </div>

            {/* ================= RIGHT: Actions ================= */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              
              {/* Mobile Search */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="lg:hidden p-2.5 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Desktop Offers */}
              <Link
                href="/offers"
                className="hidden lg:flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-full transition-all group"
              >
                <Tag className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Offers</span>
              </Link>

              {/* Desktop Orders */}
              <Link
                href="/orders"
                className="hidden lg:flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-full transition-all group"
              >
                <Package className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Orders</span>
              </Link>

              {/* Notifications Bell */}
              <Link
                href="/notifications"
                className="relative group p-2.5 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 lg:w-[22px] lg:h-[22px] group-hover:scale-110 transition-transform" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </Link>

              {/* Cart - Always Visible */}
              <Link
                href="/cart"
                className="relative group p-2.5 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 lg:w-[22px] lg:h-[22px] group-hover:scale-110 transition-transform" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-[#FF6B00] to-[#E56000] text-white text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white shadow-lg shadow-orange-500/40">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Section */}
              {!mounted ? (
                <div className="w-16 h-9 bg-slate-100 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 lg:p-1.5 lg:pr-3 text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 rounded-full transition-all group border border-transparent hover:border-orange-200"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E56000] text-white flex items-center justify-center text-sm font-black shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-bold max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF6B00]" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-orange-50 to-white">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">
                            Signed in as
                          </div>
                          <div className="text-sm font-black text-slate-900 truncate mt-0.5">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            +91 {user.phone}
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors"
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <Link
                          href="/notifications"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors"
                        >
                          <Bell className="w-4 h-4" /> Notifications
                        </Link>
                        <hr className="my-1 border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-[#FF6B00] hover:to-[#E56000] text-white text-xs lg:text-sm font-black px-3 lg:px-5 py-2 lg:py-2.5 rounded-full transition-all shadow-lg hover:shadow-orange-500/40 whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SEARCH MODAL ================= */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => {
              setShowMobileSearch(false);
              setMobileQuery("");
            }}
          ></div>
          <div className="relative bg-white shadow-2xl rounded-b-3xl overflow-hidden animate-in slide-in-from-top duration-300">
            <div className="p-4 border-b border-slate-100">
              <form onSubmit={handleMobileSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search for dishes, cuisines..."
                    value={mobileQuery}
                    onChange={(e) => setMobileQuery(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-full py-3 pl-12 pr-12 text-sm outline-none border border-transparent focus:border-[#FF6B00] focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileSearch(false);
                      setMobileQuery("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </form>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {mobileQuery.trim() && mobileResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    No results for &ldquo;
                    <span className="font-semibold text-slate-900">
                      {mobileQuery}
                    </span>
                    &rdquo;
                  </p>
                </div>
              ) : mobileQuery.trim() ? (
                <>
                  {mobileResults.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/menu/${item.id}`}
                      onClick={() => {
                        setShowMobileSearch(false);
                        setMobileQuery("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-orange-50 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">
                            {item.category}
                          </span>
                          <span className="text-xs font-black text-[#FF6B00]">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/search?q=${encodeURIComponent(mobileQuery)}`}
                    onClick={() => {
                      setShowMobileSearch(false);
                      setMobileQuery("");
                    }}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 border-t border-slate-100 text-sm font-bold text-slate-700 transition-colors"
                  >
                    View all results
                    <span className="text-[#FF6B00]">→</span>
                  </Link>
                </>
              ) : (
                <div className="p-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Paneer", "Biryani", "Chicken", "Dessert", "Starters"].map(
                      (term) => (
                        <button
                          key={term}
                          onClick={() => setMobileQuery(term)}
                          className="px-4 py-2 bg-slate-100 hover:bg-orange-100 hover:text-[#FF6B00] text-sm font-semibold text-slate-700 rounded-full transition-colors"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE DRAWER MENU ================= */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          ></div>

          <div className="absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-lg flex items-center justify-center shadow-md">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Foodie<span className="text-[#FF6B00]">Hub.</span>
                </span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* User Info */}
            {mounted && user && (
              <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E56000] text-white flex items-center justify-center text-lg font-black shadow-lg shadow-orange-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      +91 {user.phone}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-full">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="truncate text-xs font-semibold">
                  Deliver to:{" "}
                  <span className="font-bold text-slate-900">
                    Current Location
                  </span>
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { href: "/", icon: Package, label: "Home" },
                { href: "/menu", icon: Search, label: "Browse Menu" },
                { href: "/offers", icon: Tag, label: "Weekly Offers" },
                { href: "/orders", icon: Package, label: "My Orders" },
                { href: "/notifications", icon: Bell, label: "Notifications" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors group"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {item.label}
                  </Link>
                );
              })}
              {mounted && user && (
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors group"
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  My Profile
                </Link>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
              {mounted && user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#FF6B00] to-[#E56000] hover:from-[#E56000] hover:to-[#D45500] text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/40"
                >
                  <User className="w-4 h-4" /> Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}