"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { MenuItem } from "@/lib/menuData";
import { searchItems } from "@/lib/searchUtils";
import MenuCard from "@/components/menu/MenuCard";
import { useMenuStore } from "@/store/menuStore";

type SortOption = "relevance" | "price-low" | "price-high" | "rating";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const items = useMenuStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<MenuItem[]>([]);
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  useEffect(() => {
    useMenuStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const available = items.filter((i) => i.isAvailable !== false);
    let r = searchItems(query, available);
    if (vegOnly) r = r.filter((i) => i.isVeg);
    setResults(r);
  }, [query, vegOnly, items, mounted]);

  const sorted = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (!mounted) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading search results...
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <SearchIcon className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Search Results
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
          {query ? (
            <>
              Results for &ldquo;
              <span className="text-orange-600">{query}</span>&rdquo;
            </>
          ) : (
            "Search our menu"
          )}
        </h1>
        <p className="text-slate-500">
          {query
            ? `${sorted.length} item${sorted.length !== 1 ? "s" : ""} found`
            : "Type in the search bar to find your favorite dishes"}
        </p>
      </div>

      {/* Filters + Sort */}
      {query && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <label className="flex items-center gap-2 cursor-pointer select-none">
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:border-orange-500 outline-none cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {!query ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-10 h-10" />
          </div>
          <p className="text-slate-500 mb-4">
            Start typing in the search bar above
          </p>
          <Link
            href="/menu"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition-all"
          >
            Browse Full Menu
          </Link>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No results found
          </h2>
          <p className="text-slate-500 mb-8">
            {vegOnly
              ? "Try unchecking 'Veg only' or search for something else"
              : "Try a different keyword or browse our full menu"}
          </p>
          <Link
            href="/menu"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition-all"
          >
            Browse Full Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}