import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content:
        "We collect information you provide directly to us, such as your name, phone number, email address, delivery address, and payment information. We also collect data about your orders and how you interact with our website.",
    },
    {
      title: "2. How We Use Your Information",
      content:
        "We use your information to process orders, deliver food, send order updates, personalize your experience, improve our services, and communicate important information about your account or orders.",
    },
    {
      title: "3. Information Sharing",
      content:
        "We do not sell your personal information. We may share your data with delivery partners, payment processors, and service providers strictly to fulfill your orders. We may also share data when required by law.",
    },
    {
      title: "4. Data Security",
      content:
        "We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted. However, no method of transmission over the internet is 100% secure.",
    },
    {
      title: "5. Cookies",
      content:
        "We use cookies to improve your browsing experience, remember your preferences, and analyze site traffic. You can control cookies through your browser settings.",
    },
    {
      title: "6. Your Rights",
      content:
        "You have the right to access, correct, or delete your personal information. You can update your profile anytime or contact us to request data deletion.",
    },
    {
      title: "7. Changes to This Policy",
      content:
        "We may update this privacy policy from time to time. We will notify you of significant changes via email or a notice on our website.",
    },
    {
      title: "8. Contact Us",
      content:
        "If you have questions about this privacy policy, contact us at privacy@foodiehub.com or call +91 98765 43210.",
    },
  ];

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <section className="bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-16 lg:py-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg opacity-95 max-w-2xl">
            Last updated: October 2026
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 shadow-sm">
            
            <p className="text-slate-600 leading-relaxed mb-8">
              At FoodieHub, your privacy is important to us. This policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>

            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                By using FoodieHub, you agree to this privacy policy. For questions, contact{" "}
                <a href="mailto:privacy@foodiehub.com" className="text-[#FF6B00] font-semibold hover:underline">
                  privacy@foodiehub.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}