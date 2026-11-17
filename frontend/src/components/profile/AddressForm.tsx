"use client";

import { useState, useEffect } from "react";
import { X, Home, Briefcase, MapPin, Check } from "lucide-react";
import { Address, useAddressStore } from "@/store/addressStore";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  editing?: Address | null;
};

const LABELS: { key: Address["label"]; icon: typeof Home }[] = [
  { key: "Home", icon: Home },
  { key: "Work", icon: Briefcase },
  { key: "Other", icon: MapPin },
];

export default function AddressForm({ onClose, editing }: Props) {
  const addAddress = useAddressStore((state) => state.addAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);

  const [form, setForm] = useState({
    label: "Home" as Address["label"],
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        label: editing.label,
        fullName: editing.fullName,
        phone: editing.phone,
        address: editing.address,
        city: editing.city,
        pincode: editing.pincode,
        isDefault: editing.isDefault,
      });
    }
  }, [editing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.phone.length !== 10) {
      toast.error("Enter valid 10-digit phone");
      return;
    }
    if (form.pincode.length !== 6) {
      toast.error("Enter valid 6-digit pincode");
      return;
    }

    if (editing) {
      updateAddress(editing.id, form);
      toast.success("Address updated");
    } else {
      addAddress(form);
      toast.success("Address added");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
              {editing ? "Update" : "New"}
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {editing ? "Edit Address" : "Add Address"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Label */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LABELS.map(({ key, icon: Icon }) => {
                const isActive = form.label === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, label: key })}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      isActive
                        ? "border-[#FF6B00] bg-orange-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-[#FF6B00]" : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-bold ${
                        isActive ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g., John Doe"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="House no., Building, Street"
              value={form.address}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* City + Pincode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g., Mumbai"
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                placeholder="6-digit code"
                value={form.pincode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer select-none hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
              className="w-4 h-4 accent-[#FF6B00]"
            />
            <div>
              <div className="text-sm font-bold text-slate-900">
                Set as default address
              </div>
              <div className="text-xs text-slate-500">
                This will be preselected at checkout
              </div>
            </div>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
            >
              {editing ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}