import Link from "next/link";
import { RotateCcw, ArrowLeft, Clock } from "lucide-react";

export default function RefundPolicyPage() {
  const sections = [
    {
      title: "1. Food Orders",
      content:
        "100% Refund: If you cancel within 2 minutes of placing the order OR if the restaurant rejects the order. No Refund: Once the restaurant starts preparing the food, the order cannot be cancelled. If the food is delivered but has quality issues, please contact support with photos within 30 minutes.",
    },
    {
      title: "2. Table Bookings",
      content:
        "100% Advance Refund: If you cancel at least 4 hours before the booking time. No Refund: Cancellations made less than 4 hours before the booking, or if you are a 'No-Show'.",
    },
    {
      title: "3. Concert & Event Tickets",
      content:
        "Advance payments for event chairs/tickets are subject to the following rules: Cancellations made 48 hours prior to the event are eligible for a 100% refund of the advance. Cancellations within 48 hours of the event will forfeit the advance amount. In case the event is cancelled by the organizers, a full refund will be processed automatically.",
    },
    {
      title: "4. Pick & Drop Services",
      content:
        "If a trip is cancelled by the customer before the driver is assigned, a 100% refund will be initiated. If cancelled after the driver is assigned, 50% of the advance will be deducted as a cancellation fee.",
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
            <RotateCcw className="w-6 h-6" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Refund Policy
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
              We aim to provide the best experience. In case of cancellations or issues, here is how our refund system works. Please read these rules carefully.
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

            {/* Refund Time Alert */}
            <div className="flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl mt-10">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Refund Processing Time</h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Once approved, refunds for online payments will be credited back to your original payment method within <strong>5-7 business days</strong>. Cash on Delivery (COD) orders cannot be refunded to bank accounts; they will be provided as store credit or discount coupons.
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Need help with a refund? Contact our 24/7 support team with your Order ID at{" "}
                <a href="mailto:support@foodiehub.com" className="text-[#FF6B00] font-semibold hover:underline">
                  support@foodiehub.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}