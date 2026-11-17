import Link from "next/link";
import { Home, Search, ArrowRight, UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        
        {/* Big 404 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B00] to-[#3D1C00]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <UtensilsCrossed className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-2xl" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
          This dish went missing
        </h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to something delicious.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg shadow-orange-500/30"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold py-3.5 px-8 rounded-full border border-slate-200 transition-all"
          >
            <Search className="w-4 h-4" /> Browse Menu
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}