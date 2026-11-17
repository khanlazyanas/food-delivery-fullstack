"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Leaf,
  MessageSquare,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import toast from "react-hot-toast";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateInstructions = useCartStore((state) => state.updateInstructions);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const settings = useSettingsStore((state) => state.settings);

  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Delivery calcs
  const meetsMinOrder = totalPrice >= settings.minOrderValue;
  const qualifiesFreeDelivery = totalPrice >= settings.freeDeliveryAbove;
  const deliveryFee = qualifiesFreeDelivery ? 0 : settings.deliveryFee;
  const tax = Math.round((totalPrice * settings.taxPercent) / 100);
  const grandTotal = totalPrice + deliveryFee + tax;
  const freeDeliveryGap = settings.freeDeliveryAbove - totalPrice;
  const minOrderGap = settings.minOrderValue - totalPrice;

  const startEditing = (cartId: string, current: string | undefined) => {
    setEditingId(cartId);
    setEditValue(current || "");
  };

  const saveInstructions = (cartId: string) => {
    updateInstructions(cartId, editValue);
    setEditingId(null);
    setEditValue("");
    toast.success("Instructions updated");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Your cart is empty
        </h1>
        <p className="text-slate-500 mb-8">
          Looks like you haven&apos;t added anything yet. Let&apos;s fix that!
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
        >
          Browse Menu <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* HEADER */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
                Almost there
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
                Your Cart
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              {/* Min Order Warning */}
              {!meetsMinOrder && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-amber-900">
                        Minimum order ₹{settings.minOrderValue} for delivery
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">
                        Add <span className="font-bold">₹{minOrderGap}</span>{" "}
                        more to enable delivery. Or choose Pickup at checkout.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Free Delivery Progress */}
              {meetsMinOrder && freeDeliveryGap > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      Add{" "}
                      <span className="text-orange-600 font-bold">
                        ₹{freeDeliveryGap}
                      </span>{" "}
                      more for <span className="font-bold">FREE delivery</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (totalPrice / settings.freeDeliveryAbove) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Free delivery achieved */}
              {qualifiesFreeDelivery && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-800">
                      You&apos;ve unlocked FREE delivery!
                    </div>
                    <div className="text-xs text-green-700">
                      Enjoy free shipping on this order
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="group bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-lg hover:border-orange-200 transition-all"
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/menu/${item.id}`}
                      className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/menu/${item.id}`}
                            className="font-bold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-slate-500 mt-0.5">
                            ₹{item.finalPrice} each
                          </p>

                          {(item.selectedVariant ||
                            item.selectedAddOns.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.selectedVariant && (
                                <span className="text-[11px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                                  {item.selectedVariant}
                                </span>
                              )}
                              {item.selectedAddOns.map((addon) => (
                                <span
                                  key={addon}
                                  className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                                >
                                  + {addon}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.cartId)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
                          <button
                            onClick={() => decreaseQty(item.cartId)}
                            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#FF6B00] hover:text-white rounded-full transition-colors shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-slate-900 w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQty(item.cartId)}
                            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#FF6B00] hover:text-white rounded-full transition-colors shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-black text-slate-900 text-lg">
                          ₹{item.finalPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions Section */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    {editingId === item.cartId ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
                          <MessageSquare className="w-3 h-3" />
                          Edit Instructions
                        </div>
                        <textarea
                          value={editValue}
                          onChange={(e) =>
                            setEditValue(e.target.value.slice(0, 200))
                          }
                          placeholder="e.g., Less spicy, no onions..."
                          rows={2}
                          autoFocus
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-sm"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400">
                            {editValue.length}/200
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                            <button
                              onClick={() => saveInstructions(item.cartId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E56000] rounded-lg transition-colors"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : item.instructions ? (
                      <div className="flex items-start justify-between gap-3 bg-orange-50 rounded-xl p-3">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <MessageSquare className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-0.5">
                              Your Note
                            </div>
                            <p className="text-xs text-slate-700 italic leading-snug">
                              &ldquo;{item.instructions}&rdquo;
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            startEditing(item.cartId, item.instructions)
                          }
                          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Edit instructions"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(item.cartId, "")}
                        className="w-full flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Add special instructions
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/menu"
                  className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
                >
                  ← Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 sticky top-24 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₹{totalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-900">
                      {!meetsMinOrder ? (
                        <span className="text-amber-600 text-xs font-bold">
                          Min order ₹{settings.minOrderValue}
                        </span>
                      ) : deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({settings.taxPercent}%)</span>
                    <span className="font-semibold text-slate-900">₹{tax}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-base">
                      Total
                    </span>
                    <span className="font-black text-slate-900 text-2xl">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {meetsMinOrder ? (
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-between bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-between bg-slate-300 text-slate-500 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                  >
                    <span>Add ₹{minOrderGap} more</span>
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Leaf className="w-3.5 h-3.5 text-green-600" />
                    <span>Fresh ingredients guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Tag className="w-3.5 h-3.5 text-orange-600" />
                    <span>Safe &amp; secure payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}