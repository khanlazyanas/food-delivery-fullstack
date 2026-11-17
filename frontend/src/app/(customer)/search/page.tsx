import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="text-center py-20 text-slate-500">
            Loading search results...
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}