"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, Sparkles, UtensilsCrossed } from "lucide-react";
import MenuCard from "@/components/menu/MenuCard";
import { useMenuStore } from "@/store/menuStore";
import { useCategoryStore } from "@/store/categoryStore";

export default function MenuPage() {
  const items = useMenuStore((state) => state.items);
  const allCategories = useCategoryStore((state) => state.categories);
  
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    "popular" | "price-low" | "price-high" | "rating"
  >("popular");

  useEffect(() => {
    useMenuStore.persist.rehydrate();
    useCategoryStore.persist.rehydrate();
    useMenuStore.getState().syncWithDefaults();
    setMounted(true);
  }, []);

  // Reset subcategory when category changes
  useEffect(() => {
    setActiveSubcategory("All");
  }, [activeCategory]);

  // Get active categories sorted by order
  const categories = useMemo(() => {
    return allCategories
      .filter((c) => c.isActive)
      .sort((a, b) => a.order - b.order);
  }, [allCategories]);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading menu...
      </div>
    );
  }

  // Only show available items to customers
  let filtered = items.filter((i) => i.isAvailable !== false);

  if (activeCategory !== "All") {
    filtered = filtered.filter((item) => item.category === activeCategory);
  }

  if (activeSubcategory !== "All") {
    filtered = filtered.filter(
      (item) => item.subcategory === activeSubcategory
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }

  if (vegOnly) {
    filtered = filtered.filter((item) => item.isVeg);
  }

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
      default:
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    }
  });

  // Get subcategories for current category from store
  const selectedCategoryData = categories.find((c) => c.name === activeCategory);
  const currentSubcategories = selectedCategoryData ? ["All", ...selectedCategoryData.subcategories] : [];

  return (
    <div className="flex flex-col">
      
      {/* ================= HEADER ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-20 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Create for your cravings
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-4">
            Our Menu
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl opacity-95">
            Handpicked dishes made with fresh ingredients and a whole lot of love.
          </p>
        </div>
      </section>

      {/* ================= STICKY FILTER BAR ================= */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Top row: Search + Veg + Sort */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-100 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none px-4 py-2.5 rounded-full border border-slate-200 hover:border-green-400 transition-colors">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm font-semibold text-slate-700">
                Veg only
              </span>
            </label>

            <div className="flex items-center gap-2 ml-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:border-orange-500 outline-none cursor-pointer"
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Categories row */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("All")}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === "All"
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat.name
                    ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 👇 Subcategories row — only when category selected */}
          {currentSubcategories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mb-1 scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200">
              {currentSubcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubcategory(sub)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                    activeSubcategory === sub
                      ? "bg-[#3D1C00] text-white border-[#3D1C00]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= MENU GRID ================= */}
      <section className="py-14 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
                Fresh from the kitchen
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {activeCategory === "All"
                  ? "Find your next favorite"
                  : activeSubcategory === "All"
                  ? activeCategory
                  : activeSubcategory}
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No dishes found
              </h3>
              <p className="text-slate-500 mb-6">
                Try changing your filters or search query
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setVegOnly(false);
                  setActiveCategory("All");
                  setActiveSubcategory("All");
                }}
                className="inline-block bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}