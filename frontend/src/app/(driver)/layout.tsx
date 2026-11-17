"use client";

import { useEffect } from "react";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      {/* Mobile-first container (max-width 400px) */}
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}