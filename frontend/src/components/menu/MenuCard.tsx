"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { MenuItem } from "@/lib/menuData";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

type Props = {
  item: MenuItem;
};

export default function MenuCard({ item }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const isAvailable = item.isAvailable !== false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) {
      toast.error("This item is currently unavailable");
      return;
    }

    if (item.variants && item.variants.length > 0) {
      window.location.href = `/menu/${item.id}`;
      return;
    }

    addItem({
      item,
      quantity: 1,
      selectedAddOns: [],
      finalPrice: item.price,
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <Link
      href={`/menu/${item.id}`}
      className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            !isAvailable ? "grayscale" : ""
          }`}
        />

        <div className="absolute top-3 left-3 bg-white rounded-md p-1 shadow-md">
          <div
            className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-sm ${
              item.isVeg ? "border-green-600" : "border-red-600"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                item.isVeg ? "bg-green-600" : "bg-red-600"
              }`}
            ></div>
          </div>
        </div>

        {item.isBestseller && isAvailable && (
          <div className="absolute top-3 right-3 bg-[#3D1C00] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
            ★ Bestseller
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
            <Star className="w-3 h-3 fill-green-700" />
            {item.rating}
          </div>
          <span className="text-base font-black text-slate-900">
            ₹{item.price}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 leading-tight">
          {item.name}
        </h3>

        <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-grow leading-relaxed">
          {item.description}
        </p>

        <button
          onClick={handleQuickAdd}
          disabled={!isAvailable}
          className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-all duration-300 ${
            isAvailable
              ? "bg-[#FF6B00] hover:bg-[#E56000] text-white shadow-md hover:shadow-orange-500/40 group-hover:shadow-lg"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Plus className="w-4 h-4" />
          {!isAvailable
            ? "Unavailable"
            : item.variants && item.variants.length > 0
            ? "View Options"
            : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}