"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, ArrowRight, Truck } from "lucide-react";
import toast from "react-hot-toast";

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error("Enter valid 10-digit phone");
    if (pin.length !== 4) return toast.error("Enter 4-digit PIN");

    setIsLoading(true);
    // Demo Login Logic
    setTimeout(() => {
      localStorage.setItem("driver-auth", "true");
      toast.success("Login successful!");
      router.push("/driver");
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-6 bg-white">
      {/* Brand Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-orange-100 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Driver Portal</h1>
        <p className="text-slate-500 mt-2 font-medium">Login to start accepting jobs</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none font-bold text-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
            Security PIN (Demo: 1234)
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none font-bold text-lg tracking-widest"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 mt-6"
        >
          {isLoading ? "Logging in..." : "Login Now"}
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-8">
        Forgot PIN? Contact Admin.
      </p>
    </div>
  );
}