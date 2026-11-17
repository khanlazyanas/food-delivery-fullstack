import Link from "next/link";
import {
  Sparkles,
  ChefHat,
  Leaf,
  Heart,
  Award,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: ChefHat,
      title: "Crafted with Passion",
      desc: "Every dish is prepared by our expert chefs using recipes perfected over years.",
    },
    {
      icon: Leaf,
      title: "Fresh Ingredients",
      desc: "We source locally and daily to bring you the freshest seasonal produce.",
    },
    {
      icon: Heart,
      title: "Made with Love",
      desc: "We treat every order like it's for our own family. No compromises.",
    },
    {
      icon: Award,
      title: "Award Winning",
      desc: "Rated 4.9/5 by locals and recognized as one of the city's best restaurants.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "50+", label: "Signature Dishes" },
    { value: "4.9★", label: "Average Rating" },
    { value: "28min", label: "Avg Delivery" },
  ];

  return (
    <div className="flex flex-col">
      
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#FF8C42] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D1C00]/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase opacity-90">
              Our Story
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            Food that feels
            <br />
            <span className="text-[#3D1C00]">like home.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-95">
            We&apos;re not just a restaurant. We&apos;re a place where every meal is a memory and every guest is family.
          </p>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
            From a small kitchen to your heart
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            What started as a passion project has grown into one of the city&apos;s most-loved food destinations. We believe great food doesn&apos;t need shortcuts — only fresh ingredients, honest cooking, and a whole lot of love.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            Whether you&apos;re ordering in for a cozy night, celebrating a special occasion, or just craving something delicious — we&apos;re here to serve you.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-5xl font-black text-[#FF6B00] mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all"
                >
                  <div className="w-14 h-14 bg-[#FF6B00] text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#3D1C00] rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6B00]/30 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                Hungry yet?
              </h3>
              <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                Browse our full menu and taste the difference for yourself.
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-4 px-8 rounded-full transition-all shadow-xl"
              >
                Explore Menu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}