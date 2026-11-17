"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  MapPin,
  Clock,
  User,
  Phone,
  Home,
  Check,
  Lock,
  ShoppingBag,
  Plus,
  Star,
  Briefcase,
  Smartphone,
  Loader2,
  XCircle,
  AlertTriangle,
  Truck,
  Wallet,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore, Order } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { useAddressStore, Address } from "@/store/addressStore";
import { useSettingsStore } from "@/store/settingsStore";
import AddressForm from "@/components/profile/AddressForm";
import toast from "react-hot-toast";

type PaymentTab = "cod" | "online";
type OnlineMethod = "upi" | "card";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const user = useAuthStore((state) => state.user);
  const addresses = useAddressStore((state) => state.addresses);
  const settings = useSettingsStore((state) => state.settings);

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [paymentTab, setPaymentTab] = useState<PaymentTab>("cod");
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>("upi");
  const [mounted, setMounted] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // 👈 NAYA

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    instructions: "",
  });

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useOrderStore.persist.rehydrate();
    useAddressStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setUseNewAddress(false);
    } else if (addresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [addresses, selectedAddressId]);

  // 👇 FIX: isPlacingOrder check add kiya
  useEffect(() => {
    if (mounted && items.length === 0 && !isPlacingOrder) {
      router.push("/menu");
    }
  }, [mounted, items.length, router, isPlacingOrder]);

  // Auto-select payment method based on availability
  useEffect(() => {
    if (!settings.codEnabled && settings.onlinePaymentEnabled) {
      setPaymentTab("online");
    } else if (settings.codEnabled && !settings.onlinePaymentEnabled) {
      setPaymentTab("cod");
    }
  }, [settings.codEnabled, settings.onlinePaymentEnabled]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // ================= SERVICEABILITY =================
  const isPincodeServiceable = (pincode: string): boolean => {
    if (!pincode || pincode.length !== 6) return false;
    return settings.serviceablePincodes.some((prefix) =>
      pincode.startsWith(prefix)
    );
  };

  // ================= DELIVERY CALCULATIONS =================
  const isDelivery = orderType === "delivery";
  const meetsMinOrder = totalPrice >= settings.minOrderValue;
  const qualifiesFreeDelivery = totalPrice >= settings.freeDeliveryAbove;

  const deliveryFee = isDelivery
    ? qualifiesFreeDelivery
      ? 0
      : settings.deliveryFee
    : 0;

  const tax = Math.round((totalPrice * settings.taxPercent) / 100);
  const grandTotal = totalPrice + deliveryFee + tax;

  const activePincode = useNewAddress
    ? form.pincode
    : selectedAddress?.pincode || "";

  const serviceable = activePincode
    ? isPincodeServiceable(activePincode)
    : true;

  const pincodeEntered = activePincode.length === 6;

  const noPaymentMethod =
    !settings.codEnabled && !settings.onlinePaymentEnabled;

  const canPlaceOrder =
    (!isDelivery || serviceable) && meetsMinOrder && !noPaymentMethod;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (noPaymentMethod) {
      toast.error("No payment method available. Please contact the restaurant.");
      return;
    }
    if (!form.name || !form.phone) {
      toast.error("Please fill name and phone");
      return;
    }
    if (form.phone.length !== 10) {
      toast.error("Enter valid 10-digit phone");
      return;
    }

    if (isDelivery) {
      if (useNewAddress) {
        if (!form.address || !form.city || !form.pincode) {
          toast.error("Please fill full delivery address");
          return;
        }
      } else if (!selectedAddress) {
        toast.error("Please select a delivery address");
        return;
      }

      if (!serviceable) {
        toast.error("Sorry, we don't deliver to this pincode yet");
        return;
      }

      if (!meetsMinOrder) {
        toast.error(
          `Minimum order value is ₹${settings.minOrderValue} for delivery`
        );
        return;
      }
    }

    if (paymentTab === "online") {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsProcessing(false);
    }

    // 👇 FIX: Set flag BEFORE clearing cart
    setIsPlacingOrder(true);

    const finalAddress = useNewAddress
      ? {
          address: form.address,
          city: form.city,
          pincode: form.pincode,
        }
      : selectedAddress
      ? {
          address: selectedAddress.address,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        }
      : { address: "", city: "", pincode: "" };

    const order: Order = {
      id: "ORD" + Date.now().toString().slice(-8),
      items,
      subtotal: totalPrice,
      deliveryFee,
      tax,
      total: grandTotal,
      customer: {
        name: form.name,
        phone: form.phone,
        address: finalAddress.address,
        city: finalAddress.city,
        pincode: finalAddress.pincode,
        instructions: form.instructions,
      },
      orderType,
      paymentMethod: paymentTab,
      paymentStatus: paymentTab === "online" ? "paid" : "pending",
      status: "placed",
      createdAt: new Date().toISOString(),
    };

    addOrder(order);
    clearCart();
    toast.success(
      paymentTab === "online"
        ? "Payment successful! Order placed 🎉"
        : "Order placed successfully!"
    );

    // Small delay to ensure order is saved before redirect
    setTimeout(() => {
      router.push(`/order-success/${order.id}`);
    }, 100);
  };

  if (!mounted || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading...
      </div>
    );
  }

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

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* HEADER */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
                Final Step
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
                Checkout
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
            {/* LEFT: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Order Type */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    How would you like it?
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
                      orderType === "delivery"
                        ? "border-[#FF6B00] bg-orange-50 shadow-lg shadow-orange-500/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {orderType === "delivery" && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <MapPin
                      className={`w-6 h-6 mb-3 ${
                        orderType === "delivery"
                          ? "text-[#FF6B00]"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="font-bold text-slate-900 mb-1">Delivery</div>
                    <div className="text-xs text-slate-500">
                      Get it at your door
                    </div>
                  </button>

                  <button
                    onClick={() => setOrderType("pickup")}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
                      orderType === "pickup"
                        ? "border-[#FF6B00] bg-orange-50 shadow-lg shadow-orange-500/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {orderType === "pickup" && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <Clock
                      className={`w-6 h-6 mb-3 ${
                        orderType === "pickup"
                          ? "text-[#FF6B00]"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="font-bold text-slate-900 mb-1">Pickup</div>
                    <div className="text-xs text-slate-500">
                      Pick up from restaurant
                    </div>
                  </button>
                </div>

                {isDelivery && !meetsMinOrder && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-amber-900">
                        Minimum order ₹{settings.minOrderValue} for delivery
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">
                        Add ₹{settings.minOrderValue - totalPrice} more to
                        enable delivery, or choose Pickup instead.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Contact Info */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Contact Info
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Address */}
              {isDelivery && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Delivery Address
                      </h2>
                    </div>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New
                      </button>
                    )}
                  </div>

                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => {
                        const LabelIcon = getLabelIcon(addr.label);
                        const isSelected =
                          selectedAddressId === addr.id && !useNewAddress;
                        const addrServiceable = isPincodeServiceable(addr.pincode);
                        return (
                          <button
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setUseNewAddress(false);
                            }}
                            className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all ${
                              isSelected
                                ? addrServiceable
                                  ? "border-[#FF6B00] bg-orange-50 shadow-lg shadow-orange-500/10"
                                  : "border-red-400 bg-red-50"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <div
                                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${
                                  addrServiceable ? "bg-[#FF6B00]" : "bg-red-500"
                                }`}
                              >
                                {addrServiceable ? (
                                  <Check className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                <LabelIcon className="w-3.5 h-3.5 text-slate-600" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="flex items-center gap-1 bg-[#FF6B00] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                  Default
                                </span>
                              )}
                              {!addrServiceable && (
                                <span className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  Not serviceable
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-slate-900 text-sm mb-0.5">
                              {addr.fullName}
                              <span className="text-slate-400 font-normal">
                                {" "}
                                ·{" "}
                              </span>
                              <span className="text-slate-600 font-medium">
                                {addr.phone}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 leading-relaxed">
                              {addr.address}, {addr.city} — {addr.pincode}
                            </div>
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setUseNewAddress(true)}
                        className={`relative w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${
                          useNewAddress
                            ? "border-[#FF6B00] bg-orange-50"
                            : "border-slate-300 hover:border-orange-400 hover:bg-orange-50/50"
                        }`}
                      >
                        {useNewAddress && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Plus className="w-4 h-4 text-[#FF6B00]" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-900 text-sm">
                            Use a new address
                          </div>
                          <div className="text-xs text-slate-500">
                            Enter address manually below
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {(useNewAddress || addresses.length === 0) && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="relative">
                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="address"
                          placeholder="Street Address / House No. *"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="City *"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                        />
                        <input
                          type="text"
                          name="pincode"
                          placeholder="Pincode *"
                          value={form.pincode}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              pincode: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            })
                          }
                          className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border ${
                            pincodeEntered && !serviceable
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                              : pincodeEntered && serviceable
                              ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                              : "border-slate-200 focus:border-[#FF6B00] focus:ring-orange-100"
                          } focus:bg-white focus:ring-2 outline-none transition-all`}
                        />
                      </div>

                      {pincodeEntered && (
                        <div
                          className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
                            serviceable
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          {serviceable ? (
                            <>
                              <Truck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-bold text-green-800">
                                  Yay! We deliver here
                                </div>
                                <div className="text-[11px] text-green-700 mt-0.5">
                                  Delivery in 25-30 min
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-bold text-red-800">
                                  Sorry, we don&apos;t deliver here yet
                                </div>
                                <div className="text-[11px] text-red-700 mt-0.5">
                                  Try a different address or choose Pickup
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <textarea
                      name="instructions"
                      placeholder="Delivery instructions (optional) — e.g., Ring the bell twice"
                      rows={2}
                      value={form.instructions}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {isDelivery ? "4" : "3"}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Payment Method
                  </h2>
                </div>

                {noPaymentMethod ? (
                  <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-red-900">
                        No payment method available
                      </div>
                      <div className="text-xs text-red-700 mt-1">
                        Online payments are currently disabled. Please contact
                        the restaurant directly to place your order.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-3 mb-5 ${
                        settings.codEnabled && settings.onlinePaymentEnabled
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {settings.codEnabled && (
                        <button
                          onClick={() => setPaymentTab("cod")}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            paymentTab === "cod"
                              ? "border-[#FF6B00] bg-orange-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <Banknote
                            className={`w-6 h-6 mb-2 ${
                              paymentTab === "cod"
                                ? "text-[#FF6B00]"
                                : "text-slate-400"
                            }`}
                          />
                          <div className="font-bold text-slate-900 text-sm">
                            Cash on Delivery
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Pay when delivered
                          </div>
                        </button>
                      )}

                      {settings.onlinePaymentEnabled && (
                        <button
                          onClick={() => setPaymentTab("online")}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            paymentTab === "online"
                              ? "border-[#FF6B00] bg-orange-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <CreditCard
                            className={`w-6 h-6 mb-2 ${
                              paymentTab === "online"
                                ? "text-[#FF6B00]"
                                : "text-slate-400"
                            }`}
                          />
                          <div className="font-bold text-slate-900 text-sm">
                            Pay Online
                          </div>
                          <div className="text-[11px] text-slate-500">
                            UPI, Card, Wallet
                          </div>
                        </button>
                      )}
                    </div>

                    {paymentTab === "online" &&
                      settings.onlinePaymentEnabled && (
                        <div className="pt-5 border-t border-slate-100 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                            Choose Method
                          </div>

                          <button
                            onClick={() => setOnlineMethod("upi")}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                              onlineMethod === "upi"
                                ? "border-[#FF6B00] bg-orange-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                onlineMethod === "upi"
                                  ? "bg-[#FF6B00] text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 text-sm">
                                UPI
                              </div>
                              <div className="text-xs text-slate-500">
                                GPay · PhonePe · Paytm · BHIM
                              </div>
                            </div>
                            {onlineMethod === "upi" && (
                              <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => setOnlineMethod("card")}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                              onlineMethod === "card"
                                ? "border-[#FF6B00] bg-orange-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                onlineMethod === "card"
                                  ? "bg-[#FF6B00] text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 text-sm">
                                Credit / Debit Card
                              </div>
                              <div className="text-xs text-slate-500">
                                Visa · Mastercard · RuPay
                              </div>
                            </div>
                            {onlineMethod === "card" && (
                              <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>

                          <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-700 leading-snug">
                              <strong>Demo mode:</strong> No real payment will
                              be processed. Real Razorpay integration coming in
                              Phase 2.
                            </p>
                          </div>
                        </div>
                      )}

                    {(settings.codEnabled || settings.onlinePaymentEnabled) &&
                      !(settings.codEnabled && settings.onlinePaymentEnabled) && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <Wallet className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-blue-700 leading-snug">
                            {settings.codEnabled
                              ? "Only Cash on Delivery is available at the moment."
                              : "Only online payment is available at the moment."}
                          </p>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 sticky top-24 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.selectedVariant && `${item.selectedVariant} · `}
                          Qty {item.quantity}
                        </div>
                        {item.instructions && (
                          <div className="text-[10px] text-orange-600 italic mt-0.5 truncate">
                            &ldquo;{item.instructions}&rdquo;
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 flex-shrink-0">
                        ₹{item.finalPrice * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2.5 text-sm mb-5">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₹{totalPrice}
                    </span>
                  </div>
                  {isDelivery && (
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-slate-900">
                        {deliveryFee === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>
                  )}
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

                {isDelivery && pincodeEntered && !serviceable && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-700 leading-snug">
                      Delivery not available at this pincode. Please change
                      address or select Pickup.
                    </p>
                  </div>
                )}

                {noPaymentMethod && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-700 leading-snug">
                      No payment method available. Please contact the
                      restaurant.
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    isProcessing ||
                    (isDelivery && !canPlaceOrder) ||
                    noPaymentMethod
                  }
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : noPaymentMethod ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      Payment Unavailable
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {paymentTab === "online"
                        ? `Pay ₹${grandTotal}`
                        : `Place Order · ₹${grandTotal}`}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  By placing order you agree to our{" "}
                  <Link
                    href="/terms"
                    className="hover:text-orange-600 underline"
                  >
                    Terms
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showAddressForm && (
        <AddressForm
          onClose={() => setShowAddressForm(false)}
          editing={null}
        />
      )}
    </div>
  );
}