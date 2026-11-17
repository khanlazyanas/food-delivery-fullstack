import Link from "next/link";
import { Shield, ArrowLeft, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: "1. General Overview",
      content:
        "FoodieHub provides food delivery, table booking, event ticketing, pick & drop services, and special occasion celebrations. These terms apply to all users of our website and mobile application. We reserve the right to update these terms at any time without prior notice.",
    },
    {
      title: "2. Order & Delivery Policy",
      content:
        "Delivery times provided are estimates and may vary due to weather or traffic conditions. Minimum order value and delivery charges apply as shown at checkout. Once an order is marked as 'Preparing' by the restaurant, it cannot be cancelled or modified. Customers must provide an accurate address and phone number. If the driver cannot reach you, the order will be marked undelivered and no refund will be issued.",
    },
    {
      title: "3. Table Booking & Event Rules",
      content:
        "Table bookings require a 50% advance payment to confirm the reservation. Event tickets (Concerts) are non-transferable. Entry will be denied without a valid QR code. Outside food and beverages are strictly prohibited at event venues.",
    },
    {
      title: "4. Pick & Drop Services",
      content:
        "Our Pick & Drop service operates within a specific radius. Customers are requested to be ready at the pickup location at least 10 minutes before the scheduled time. FoodieHub is not responsible for delays caused by the customer.",
    },
    {
      title: "5. Account & Security",
      content:
        "You are responsible for maintaining the confidentiality of your account details. Any activity performed under your account will be deemed your responsibility. You must notify us immediately of any unauthorized use.",
    },
    {
      title: "6. Limitation of Liability",
      content:
        "FoodieHub is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our maximum liability for any claim shall not exceed the amount paid by you for the specific order or service.",
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
            <FileText className="w-6 h-6" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Terms & Conditions
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
              Please read these terms carefully before using FoodieHub services. By placing an order or making a booking, you agree to the following terms and conditions.
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
                By using FoodieHub, you agree to these terms. For any legal queries, contact{" "}
                <a href="mailto:legal@foodiehub.com" className="text-[#FF6B00] font-semibold hover:underline">
                  legal@foodiehub.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}