"use client";

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { MenuItem } from "@/lib/menuData";

type Props = {
  query: string;
  results: MenuItem[];
  onClose: () => void;
};

export default function SearchDropdown({ query, results, onClose }: Props) {
  if (!query.trim()) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
      
      {results.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500">
            No results found for &ldquo;<span className="font-semibold text-slate-900">{query}</span>&rdquo;
          </p>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto">
            {results.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/menu/${item.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        item.isVeg ? "border-green-600" : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900 truncate">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      ₹{item.price}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 border-t border-slate-100 transition-colors group"
          >
            <span className="text-sm font-semibold text-slate-700">
              View all results for &ldquo;{query}&rdquo;
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </>
      )}
    </div>
  );
}