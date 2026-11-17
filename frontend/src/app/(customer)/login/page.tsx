"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Mail,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

type Step =
  | "details"
  | "otp"
  | "forgot-phone"
  | "forgot-otp"
  | "forgot-password"
  | "success";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState<Step>("details");
  const [isSignup, setIsSignup] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state (6 digits as array)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot password
  const [forgotPhone, setForgotPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Auto-focus OTP inputs
  useEffect(() => {
    if (step === "otp" || step === "forgot-otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Reset OTP when step changes
  const resetOtp = () => setOtp(["", "", "", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const otpString = otp.join("");

  // ================= HANDLERS =================

  const handleSendOtp = () => {
    if (!phone || phone.length !== 10) {
      toast.error("Enter valid 10-digit phone number");
      return;
    }
    if (isSignup && !name.trim()) {
      toast.error("Enter your name");
      return;
    }
    if (isSignup && email && !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter valid email");
      return;
    }
    setStep("otp");
    resetOtp();
    toast.success("OTP sent! (Use 123456 for demo)");
  };

  const handleVerifyOtp = () => {
    if (otpString !== "123456") {
      toast.error("Invalid OTP. Use 123456 for demo");
      return;
    }
    login({
      id: "USR" + Date.now().toString().slice(-6),
      name: isSignup ? name : `User ${phone.slice(-4)}`,
      phone,
      email: email || undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success(isSignup ? "Account created!" : "Welcome back!");
    router.push("/");
  };

  const handleForgotSendOtp = () => {
    if (!forgotPhone || forgotPhone.length !== 10) {
      toast.error("Enter valid 10-digit phone number");
      return;
    }
    setStep("forgot-otp");
    resetOtp();
    toast.success("OTP sent! (Use 123456 for demo)");
  };

  const handleForgotVerifyOtp = () => {
    if (otpString !== "123456") {
      toast.error("Invalid OTP. Use 123456 for demo");
      return;
    }
    setStep("forgot-password");
    resetOtp();
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setStep("success");
    toast.success("Password reset successfully!");
  };

  const goBack = () => {
    setStep("details");
    resetOtp();
    setForgotPhone("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ================= OTP INPUT COMPONENT =================
  const OtpInput = () => (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            otpRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          className="w-full aspect-square max-w-[56px] text-center text-2xl font-black rounded-2xl bg-white text-slate-900 border-2 border-slate-200 focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      
      {/* ================= LEFT SIDE (Brand) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3D1C00]/30 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full text-white">
          <Link href="/" className="text-3xl font-black tracking-tight">
            Foodie<span className="text-[#3D1C00]">Hub.</span>
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
                Welcome to the family
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Good food is
              <br />
              <span className="text-[#3D1C00]">always waiting.</span>
            </h1>
            <p className="text-lg opacity-95 max-w-md leading-relaxed">
              Login to order your favorite dishes, track deliveries, and get
              exclusive offers — all in one place.
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-black">4.9★</div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Rated by locals
              </div>
            </div>
            <div>
              <div className="text-3xl font-black">28min</div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Avg delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE (Form) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12 relative">
        
        {/* Mobile Logo */}
        <div className="absolute top-8 left-6 lg:hidden">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Foodie<span className="text-[#FF6B00]">Hub.</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          
          {/* ================= HEADER ================= */}
          <div className="mb-10">
            {(step === "forgot-phone" ||
              step === "forgot-otp" ||
              step === "forgot-password") && (
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#FF6B00] mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            )}

            <span className="block text-xs font-bold tracking-[0.25em] uppercase text-[#FF6B00]">
              {step === "details" &&
                (isSignup ? "Create Account" : "Welcome Back")}
              {step === "otp" && "Verification"}
              {step === "forgot-phone" && "Password Recovery"}
              {step === "forgot-otp" && "Verify Identity"}
              {step === "forgot-password" && "Set New Password"}
              {step === "success" && "All Done"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-3 mb-3">
              {step === "details" && (isSignup ? "Sign Up" : "Login")}
              {step === "otp" && "Verify OTP"}
              {step === "forgot-phone" && "Forgot Password?"}
              {step === "forgot-otp" && "Enter OTP"}
              {step === "forgot-password" && "New Password"}
              {step === "success" && "Password Reset"}
            </h2>
            <p className="text-slate-500">
              {step === "details" &&
                (isSignup
                  ? "Create your account to start ordering"
                  : "Login with your phone number to continue")}
              {step === "otp" && (
                <>
                  We sent a 6-digit code to{" "}
                  <span className="font-bold text-slate-900">+91 {phone}</span>
                </>
              )}
              {step === "forgot-phone" &&
                "Enter your registered phone number to reset password"}
              {step === "forgot-otp" && (
                <>
                  Enter OTP sent to{" "}
                  <span className="font-bold text-slate-900">
                    +91 {forgotPhone}
                  </span>
                </>
              )}
              {step === "forgot-password" &&
                "Create a new password for your account"}
              {step === "success" &&
                "Your password has been updated. You can now login."}
            </p>
          </div>

          {/* ================= STEP: DETAILS ================= */}
          {step === "details" && (
            <div className="space-y-4">
              
              {isSignup && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full pl-[68px] pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              {isSignup && (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
              )}

              <button
                onClick={handleSendOtp}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 mt-2"
              >
                Send OTP <ArrowRight className="w-4 h-4" />
              </button>

              {/* Forgot Password */}
              {!isSignup && (
                <div className="text-center">
                  <button
                    onClick={() => setStep("forgot-phone")}
                    className="text-sm font-semibold text-slate-500 hover:text-[#FF6B00] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Toggle Login/Signup */}
              <div className="text-center mt-6 text-sm text-slate-500">
                {isSignup ? "Already have an account?" : "New here?"}{" "}
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="font-bold text-[#FF6B00] hover:underline"
                >
                  {isSignup ? "Login" : "Sign up"}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP: OTP ================= */}
          {step === "otp" && (
            <div className="space-y-5">
              <OtpInput />

              <p className="text-center text-xs text-slate-400">
                Demo OTP:{" "}
                <span className="font-bold text-[#FF6B00]">123456</span>
              </p>

              <button
                onClick={handleVerifyOtp}
                disabled={otpString.length !== 6}
                className="w-full bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
              >
                Verify &amp; Continue
              </button>

              <div className="flex justify-between text-xs">
                <button
                  onClick={() => {
                    setStep("details");
                    resetOtp();
                  }}
                  className="text-slate-500 hover:text-[#FF6B00] font-semibold transition-colors"
                >
                  ← Change number
                </button>
                <button
                  onClick={() => {
                    resetOtp();
                    toast.success("OTP resent! (Use 123456)");
                  }}
                  className="text-[#FF6B00] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP: FORGOT PHONE ================= */}
          {step === "forgot-phone" && (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Registered Phone Number"
                  value={forgotPhone}
                  onChange={(e) =>
                    setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full pl-[68px] pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleForgotSendOtp}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
              >
                Send OTP <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= STEP: FORGOT OTP ================= */}
          {step === "forgot-otp" && (
            <div className="space-y-5">
              <OtpInput />

              <p className="text-center text-xs text-slate-400">
                Demo OTP:{" "}
                <span className="font-bold text-[#FF6B00]">123456</span>
              </p>

              <button
                onClick={handleForgotVerifyOtp}
                disabled={otpString.length !== 6}
                className="w-full bg-[#FF6B00] hover:bg-[#E56000] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
              >
                Verify OTP
              </button>

              <button
                onClick={() => {
                  setStep("forgot-phone");
                  resetOtp();
                }}
                className="w-full text-xs text-slate-500 hover:text-[#FF6B00] font-semibold transition-colors"
              >
                ← Change phone number
              </button>
            </div>
          )}

          {/* ================= STEP: FORGOT PASSWORD ================= */}
          {step === "forgot-password" && (
            <div className="space-y-4">
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleResetPassword}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
              >
                Reset Password <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= STEP: SUCCESS ================= */}
          {step === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-green-800">
                  Password reset successfully!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  You can now login with your new password.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep("details");
                  setIsSignup(false);
                  setPassword("");
                  setConfirmPassword("");
                  setNewPassword("");
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
              >
                Back to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Terms */}
          {step !== "success" && (
            <p className="text-center text-xs text-slate-400 mt-8">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="hover:text-[#FF6B00] underline">
                Terms
              </Link>{" "}
              &amp;{" "}
              <Link href="/privacy" className="hover:text-[#FF6B00] underline">
                Privacy Policy
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}