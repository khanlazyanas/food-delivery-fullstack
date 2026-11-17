"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  Store,
  Truck,
  Percent,
  Bell,
  Plus,
  X,
  Check,
  MapPin,
  Phone,
  Mail,
  Clock,
  IndianRupee,
  Banknote,
  CreditCard,
  Wallet,
  AlertTriangle,
  CalendarDays,
  Users,
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetToDefault = useSettingsStore((state) => state.resetToDefault);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "restaurant" | "delivery" | "tax" | "payment" | "booking" | "notifications"
  >("restaurant");

  const [form, setForm] = useState(settings);
  const [newPincode, setNewPincode] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    setForm(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    setHasChanges(JSON.stringify(form) !== JSON.stringify(settings));
  }, [form, settings]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading settings...</div>;
  }

  const noPaymentMethod = !form.codEnabled && !form.onlinePaymentEnabled;

  const handleSave = () => {
    if (noPaymentMethod) {
      toast.error("Enable at least one payment method");
      return;
    }
    updateSettings(form);
    toast.success("Settings saved");
    setHasChanges(false);
  };

  const handleReset = () => {
    if (!confirm("Reset all settings to default? This cannot be undone."))
      return;
    resetToDefault();
    toast.success("Settings reset to default");
  };

  const handleAddPincode = () => {
    const cleaned = newPincode.trim().replace(/\D/g, "").slice(0, 3);
    if (cleaned.length < 3) {
      toast.error("Enter at least 3 digits");
      return;
    }
    if (form.serviceablePincodes.includes(cleaned)) {
      toast.error("Pincode prefix already added");
      return;
    }
    setForm({
      ...form,
      serviceablePincodes: [...form.serviceablePincodes, cleaned],
    });
    setNewPincode("");
    toast.success(`Added prefix ${cleaned}xxx`);
  };

  const handleRemovePincode = (pincode: string) => {
    setForm({
      ...form,
      serviceablePincodes: form.serviceablePincodes.filter((p) => p !== pincode),
    });
    toast.success("Pincode prefix removed");
  };

  const handleAddTimeSlot = () => {
    if (!newTimeSlot.trim()) return;
    if (form.bookingTimeSlots.includes(newTimeSlot)) {
      toast.error("Time slot already exists");
      return;
    }
    const updated = [...form.bookingTimeSlots, newTimeSlot].sort();
    setForm({ ...form, bookingTimeSlots: updated });
    setNewTimeSlot("");
  };

  const handleRemoveTimeSlot = (slot: string) => {
    setForm({
      ...form,
      bookingTimeSlots: form.bookingTimeSlots.filter((s) => s !== slot),
    });
  };

  const tabs = [
    { key: "restaurant", label: "Restaurant", icon: Store },
    { key: "delivery", label: "Delivery", icon: Truck },
    { key: "tax", label: "Tax", icon: Percent },
    { key: "payment", label: "Payment", icon: Wallet },
    { key: "booking", label: "Booking", icon: CalendarDays },
    { key: "notifications", label: "Alerts", icon: Bell },
  ] as const;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Configuration
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
            Settings
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Manage restaurant info, delivery rules and preferences
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 mb-6 flex gap-1 overflow-x-auto pb-2 md:pb-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-8 shadow-sm">
        
        {/* ============ RESTAURANT TAB ============ */}
        {activeTab === "restaurant" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                Restaurant Information
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Basic info that appears across your website
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Tagline
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Opens
                  </label>
                  <input
                    type="time"
                    value={form.openingTime}
                    onChange={(e) =>
                      setForm({ ...form, openingTime: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Closes
                  </label>
                  <input
                    type="time"
                    value={form.closingTime}
                    onChange={(e) =>
                      setForm({ ...form, closingTime: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ DELIVERY TAB ============ */}
        {activeTab === "delivery" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                Delivery Rules
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Configure range, charges and serviceable areas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Truck className="w-3 h-3" /> Delivery Range (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={form.deliveryRangeKm}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deliveryRangeKm: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-1.5">
                  Orders outside this range won&apos;t be accepted
                </p>
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <IndianRupee className="w-3 h-3" /> Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.deliveryFee}
                  onChange={(e) =>
                    setForm({ ...form, deliveryFee: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Free Delivery Above (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.freeDeliveryAbove}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      freeDeliveryAbove: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                Serviceable Pincodes
              </h3>
              <p className="text-[10px] md:text-xs text-slate-500 mb-4">
                Add 3-digit prefixes (e.g., 400 for all Mumbai pincodes 400xxx)
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newPincode}
                  onChange={(e) =>
                    setNewPincode(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAddPincode()}
                  placeholder="e.g., 400"
                  maxLength={3}
                  className="w-full sm:max-w-[180px] px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all font-bold tracking-widest text-center text-sm md:text-base"
                />
                <button
                  onClick={handleAddPincode}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {form.serviceablePincodes.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    No pincodes added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.serviceablePincodes.map((pincode) => (
                    <div
                      key={pincode}
                      className="group flex items-center gap-2 bg-slate-100 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 px-3 py-1.5 md:py-2 rounded-xl transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span className="font-bold text-slate-900 text-xs md:text-sm tracking-wider">
                        {pincode}xxx
                      </span>
                      <button
                        onClick={() => handleRemovePincode(pincode)}
                        className="p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label={`Remove ${pincode}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ TAX TAB ============ */}
        {activeTab === "tax" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                Tax Settings
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                GST / service tax applied on all orders
              </p>
            </div>

            <div className="max-w-xs">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                <Percent className="w-3 h-3" /> Tax Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={form.taxPercent}
                  onChange={(e) =>
                    setForm({ ...form, taxPercent: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  %
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 mt-1.5">
                Applied on order subtotal
              </p>
            </div>
          </div>
        )}

        {/* ============ PAYMENT TAB ============ */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                Payment Methods
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Choose which payment methods are available at checkout
              </p>
            </div>

            {noPaymentMethod && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-900">
                    At least one payment method required
                  </div>
                  <div className="text-[10px] md:text-xs text-amber-700 mt-0.5">
                    Customers won&apos;t be able to place orders if both are disabled.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-w-2xl">
              <label
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all gap-3 ${
                  form.codEnabled
                    ? "border-green-300 bg-green-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      form.codEnabled
                        ? "bg-[#FF6B00] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Banknote className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm md:text-base truncate">
                      Cash on Delivery
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                      Pay when order arrives
                    </div>
                    <div
                      className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        form.codEnabled ? "text-green-700" : "text-slate-400"
                      }`}
                    >
                      {form.codEnabled ? "✓ Enabled" : "✗ Disabled"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.codEnabled ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.codEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>

              <label
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all gap-3 ${
                  form.onlinePaymentEnabled
                    ? "border-green-300 bg-green-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      form.onlinePaymentEnabled
                        ? "bg-[#FF6B00] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm md:text-base truncate">
                      Online Payment
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                      UPI, Card, Netbanking
                    </div>
                    <div
                      className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        form.onlinePaymentEnabled
                          ? "text-green-700"
                          : "text-slate-400"
                      }`}
                    >
                      {form.onlinePaymentEnabled ? "✓ Enabled" : "✗ Disabled"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.onlinePaymentEnabled ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.onlinePaymentEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>

              <div className="flex items-start gap-2 p-3 md:p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                <Wallet className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] md:text-[11px] text-blue-700 leading-snug">
                  Disabled methods will be hidden from the checkout page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============ BOOKING TAB ============ */}
        {activeTab === "booking" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                Table Booking
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Configure advance payment, cancellation and time slots
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <IndianRupee className="w-3 h-3" /> Advance Payment (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.advancePaymentPercent}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      advancePaymentPercent: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-1.5">
                  {form.advancePaymentPercent}% collected in advance
                </p>
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Free Cancellation (hrs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.cancellationHoursBefore}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cancellationHoursBefore: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Max Guests / Booking
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxGuestsPerBooking}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxGuestsPerBooking: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-300 cursor-pointer transition-colors gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-xs md:text-sm">
                    Enable Table Booking
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                    Customers can book tables online
                  </div>
                </div>
                <div
                  className={`w-10 md:w-12 h-6 md:h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.tableBookingEnabled ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.tableBookingEnabled ? "translate-x-4 md:translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-300 cursor-pointer transition-colors gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-xs md:text-sm">
                    Allow Rescheduling
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                    Customers can change date/time
                  </div>
                </div>
                <div
                  className={`w-10 md:w-12 h-6 md:h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.rescheduleAllowed ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.rescheduleAllowed ? "translate-x-4 md:translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                Booking Time Slots
              </h3>
              <p className="text-[10px] md:text-xs text-slate-500 mb-4">
                Time slots customers can choose when booking
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="time"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full sm:max-w-[180px] px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all font-bold text-sm md:text-base"
                />
                <button
                  onClick={handleAddTimeSlot}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {form.bookingTimeSlots.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    No time slots added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.bookingTimeSlots.map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 px-2.5 md:px-3 py-1.5 md:py-2 rounded-xl transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span className="font-bold text-slate-900 text-xs md:text-sm">
                        {slot}
                      </span>
                      <button
                        onClick={() => handleRemoveTimeSlot(slot)}
                        className="p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label={`Remove ${slot}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ NOTIFICATIONS TAB ============ */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-1">
                Notifications
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Control what notifications you receive
              </p>
            </div>

            <div className="space-y-3 max-w-2xl">
              <label className="flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-300 cursor-pointer transition-colors gap-2">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs md:text-sm">
                      Order Notifications
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                      New order alerts, status updates
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 md:w-12 h-6 md:h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.orderNotifications ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.orderNotifications ? "translate-x-4 md:translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-300 cursor-pointer transition-colors gap-2">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Percent className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs md:text-sm">
                      Offer Notifications
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                      Weekly offers and promotional alerts
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 md:w-12 h-6 md:h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.offerNotifications ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.offerNotifications ? "translate-x-4 md:translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[90%] sm:w-auto">
          <div className="bg-slate-900 text-white px-4 md:px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                You have unsaved changes
              </span>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <Check className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}