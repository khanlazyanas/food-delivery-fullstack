"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";

// Custom SVG brand icons
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  // ✅ FIX: Saare core services ke links add kiye
  const quickLinks = [
    { href: "/menu", label: "Our Menu" },
    { href: "/offers", label: "Weekly Offers" },
    { href: "/orders", label: "Track Order" },
    { href: "/about", label: "About Us" },
  ];

  const serviceLinks = [
    { href: "/table-booking", label: "Table Booking" },
    { href: "/events", label: "Live Events" },
    { href: "/pick-drop", label: "Pick & Drop" },
    { href: "/celebrations", label: "Celebrations" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/contact", label: "Contact Us" },
    { href: "/refund", label: "Refund Policy" }, // ✅ FIX: Refund ka alag link
  ];

  const socials = [
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: FacebookIcon, href: "#", label: "Facebook" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed to newsletter!");
  };

  return (
    <footer className="bg-[#3D1C00] text-white mt-auto">
      
      {/* ================= TOP NEWSLETTER STRIP ================= */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                Get exclusive offers 🍕
              </h3>
              <p className="text-white/60 text-sm">
                Subscribe for weekly deals and new dish alerts.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full lg:w-auto max-w-md gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 lg:w-72 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#FF6B00] outline-none transition-all text-sm"
              />
              <button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold px-6 py-3.5 rounded-full transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Subscribe <ArrowRight className="w-4 h-4 hidden sm:block" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
          
          {/* 1. Brand Info (Full width on mobile) */}
          <div className="col-span-2 lg:col-span-1 pr-4">
            <Link href="/" className="flex items-center gap-2.5 group mb-5 w-fit">
              <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B00] to-[#E56000] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Foodie<span className="text-[#FF6B00]">Hub.</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Delicious food delivered hot and fresh to your doorstep. Order online from our extensive menu of starters, mains, and desserts.
            </p>

            {/* Socials */}
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-white/5 border border-white/10 hover:bg-[#FF6B00] hover:border-[#FF6B00] rounded-xl flex items-center justify-center transition-all hover:-translate-y-1"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-[10px] md:text-xs">
              Explore
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FF6B00] text-xs md:text-sm font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Services (NAYA COLUMN) */}
          <div>
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-[10px] md:text-xs">
              Our Services
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FF6B00] text-xs md:text-sm font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Support */}
          <div>
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-[10px] md:text-xs">
              Support
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#FF6B00] text-xs md:text-sm font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Contact (Full width on mobile) */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="text-white font-black mb-5 uppercase tracking-widest text-[10px] md:text-xs">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <span className="text-white/60 text-xs md:text-sm leading-snug pt-1">
                  123 Food Street, Flavor Town,<br />
                  Mumbai, MH 400001
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <a href="tel:+919876543210" className="text-white/60 hover:text-[#FF6B00] text-xs md:text-sm font-semibold pt-1 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <a href="mailto:hello@foodiehub.com" className="text-white/60 hover:text-[#FF6B00] text-xs md:text-sm font-semibold pt-1 transition-colors">
                  hello@foodiehub.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <span className="text-white/60 text-xs md:text-sm leading-snug pt-1">
                  Mon-Sun, 10 AM - 11 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            
            <p className="text-white/50 text-center md:text-left">
              &copy; {new Date().getFullYear()} FoodieHub. All rights reserved.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-semibold uppercase tracking-wider text-[9px]">We Accept</span>
              <div className="flex gap-1">
                <div className="bg-white px-1.5 py-0.5 rounded text-[8px] font-black text-blue-800">VISA</div>
                <div className="bg-white px-1.5 py-0.5 rounded text-[8px] font-black text-red-600">MC</div>
                <div className="bg-white px-1.5 py-0.5 rounded text-[8px] font-black text-green-700">UPI</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-white/50 font-medium">
              <span>Designed & Built with</span>
              <span className="text-[#FF6B00] text-sm">❤️</span>
              <span>in India</span>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}