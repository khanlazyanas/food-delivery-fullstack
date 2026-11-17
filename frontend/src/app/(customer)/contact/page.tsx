import { MapPin, Phone, Mail, Clock } from "lucide-react";

// Custom SVG brand icons (lucide removed brand icons)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function ContactPage() {
  const contactInfo = [
    {
      icon: MapPin,
      label: "Visit Us",
      value: "123 Food Street, Flavor Town",
      sub: "Mumbai, Maharashtra 400001",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: "+91 98765 43210",
      sub: "Mon-Sun, 10 AM - 11 PM",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: "hello@foodiehub.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: Clock,
      label: "Opening Hours",
      value: "10:00 AM - 11:00 PM",
      sub: "All days of the week",
    },
  ];

  const socials = [
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: FacebookIcon, href: "#", label: "Facebook" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
  ];

  return (
    <div className="flex flex-col">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-20 lg:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mt-3 mb-6">
            Say hello.
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-xl mx-auto opacity-95">
            Questions, feedback, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ================= CONTACT INFO ================= */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-6 rounded-3xl bg-white border border-slate-100 hover:shadow-xl hover:border-orange-200 transition-all text-center"
                >
                  <div className="w-14 h-14 bg-orange-100 text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    {item.label}
                  </div>
                  <div className="text-base font-black text-slate-900 mb-1">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500">{item.sub}</div>
                </div>
              );
            })}
          </div>

          {/* ================= FORM + MAP ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Contact Form */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
                Send us a message
              </h2>

              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Map + Social */}
            <div className="space-y-6">
              
              {/* Map placeholder */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location"
                ></iframe>
              </div>

              {/* Social */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  {socials.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="w-12 h-12 bg-slate-100 hover:bg-[#FF6B00] hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}