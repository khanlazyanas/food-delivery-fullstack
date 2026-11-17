"use client";

import { use, useEffect, useState } from "react";
import { useMenuStore } from "@/store/menuStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Clock,
  Flame,
  MessageSquare,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

const MAX_INSTRUCTIONS = 200;

export default function FoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const items = useMenuStore((state) => state.items);
  const item = items.find((i) => i.id === Number(id));
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    item?.variants?.[0]?.name
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (!item) router.push("/menu");
  }, [item, router]);

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  // Price calculation
  const variantPrice =
    item.variants?.find((v) => v.name === selectedVariant)?.price ||
    item.price;

  const addOnsPrice = selectedAddOns.reduce((sum, name) => {
    const addOn = item.addOns?.find((a) => a.name === name);
    return sum + (addOn?.price || 0);
  }, 0);

  const unitPrice = variantPrice + addOnsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    addItem({
      item,
      quantity,
      selectedVariant,
      selectedAddOns,
      finalPrice: unitPrice,
      instructions: instructions.trim() || undefined,
    });
    toast.success(`${item.name} added to cart!`);
    router.push("/cart");
  };

  const similarItems = items
    .filter(
      (i) =>
        i.category === item.category &&
        i.id !== item.id &&
        i.isAvailable !== false
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      
      {/* ================= BREADCRUMB BAR ================= */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
        </div>
      </div>

      {/* ================= MAIN DETAIL SECTION ================= */}
      <section className="py-10 lg:py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Left: Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden bg-white shadow-2xl aspect-square sticky top-24">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Bestseller Badge */}
                {item.isBestseller && (
                  <div className="absolute top-6 left-6 bg-[#3D1C00] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                    Bestseller
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex flex-col">
              
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  
                  {/* Veg/Non-Veg */}
                  <div className="bg-white rounded-md p-1.5 border border-slate-200 shadow-sm">
                    <div
                      className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm ${
                        item.isVeg ? "border-green-600" : "border-red-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.isVeg ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 text-sm font-bold px-3 py-1.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-green-700" />
                    {item.rating}
                  </div>

                  {/* Category */}
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {item.category}
                  </span>

                  {/* Subcategory */}
                  {item.subcategory && (
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                      {item.subcategory}
                    </span>
                  )}

                  {/* Time */}
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    25-30 min
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-[1.05]">
                  {item.name}
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Variants */}
              {item.variants && item.variants.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">
                    Choose Size
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {item.variants.map((variant) => {
                      const isActive = selectedVariant === variant.name;
                      return (
                        <button
                          key={variant.name}
                          onClick={() => setSelectedVariant(variant.name)}
                          className={`p-4 rounded-2xl border-2 transition-all text-left relative ${
                            isActive
                              ? "border-[#FF6B00] bg-orange-50 shadow-lg shadow-orange-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">
                              {variant.name}
                            </span>
                            {isActive && (
                              <div className="w-6 h-6 bg-[#FF6B00] text-white rounded-full flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-500">
                            ₹{variant.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {item.addOns && item.addOns.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">
                    Add Extras (Optional)
                  </h3>
                  <div className="space-y-2.5">
                    {item.addOns.map((addOn) => {
                      const isSelected = selectedAddOns.includes(addOn.name);
                      return (
                        <label
                          key={addOn.name}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#FF6B00] bg-orange-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-[#FF6B00] border-[#FF6B00]"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">
                              {addOn.name}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 text-sm">
                            +₹{addOn.price}
                          </span>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => toggleAddOn(addOn.name)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 👇 NAYA: Special Instructions */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#FF6B00]" />
                  Special Instructions
                </h3>
                <div className="relative">
                  <textarea
                    value={instructions}
                    onChange={(e) =>
                      setInstructions(e.target.value.slice(0, MAX_INSTRUCTIONS))
                    }
                    placeholder="Any special requests? (e.g., less spicy, no onions, extra sauce...)"
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400">
                    {instructions.length}/{MAX_INSTRUCTIONS}
                  </span>
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="mt-auto bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky bottom-4">
                
                {/* Quantity Selector */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                    Quantity
                  </span>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-full p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#FF6B00] hover:text-white rounded-full transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-black text-slate-900 w-8 text-center text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#FF6B00] hover:text-white rounded-full transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-between bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </span>
                  <span className="text-lg font-black">₹{totalPrice}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIMILAR ITEMS ================= */}
      {similarItems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
                You might also like
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
                More from {item.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarItems.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/menu/${similar.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img
                      src={similar.image}
                      alt={similar.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Veg indicator */}
                    <div className="absolute top-3 left-3 bg-white rounded-md p-1 shadow-md">
                      <div
                        className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-sm ${
                          similar.isVeg
                            ? "border-green-600"
                            : "border-red-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            similar.isVeg ? "bg-green-600" : "bg-red-600"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded w-fit mb-2">
                      <Star className="w-3 h-3 fill-green-700" />
                      {similar.rating}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                      {similar.name}
                    </h3>
                    <span className="font-black text-orange-600">
                      ₹{similar.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}