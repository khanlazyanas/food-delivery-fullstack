"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Calendar, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
};

export default function EditProfileModal({ onClose }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "" as "" | "male" | "female" | "other",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Enter valid email");
      return;
    }

    updateProfile({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
    });
    toast.success("Profile updated");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
              Edit
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Personal Info
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
          
          {/* Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone (read-only) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Phone Number
            </label>
            <input
              type="text"
              value={`+91 ${user?.phone || ""}`}
              disabled
              className="w-full px-4 py-3.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Phone number cannot be changed. Contact support for help.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Email (optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Date of Birth (optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              We&apos;ll send you special birthday offers 🎂
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Gender (optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["male", "female", "other"] as const).map((g) => {
                const isActive = form.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, gender: isActive ? "" : g })
                    }
                    className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? "border-[#FF6B00] bg-orange-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span
                      className={`text-sm font-bold capitalize ${
                        isActive ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {g}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}