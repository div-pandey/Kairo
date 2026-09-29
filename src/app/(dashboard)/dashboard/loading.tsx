import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-6xl mx-auto space-y-8 sm:space-y-10 font-mono-code animate-fade-in">
      
      {/* ── Header Skeleton ───────────────────────────────── */}
      <div className="border-b border-[#E5DFD5] pb-6 sm:pb-8 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-72 sm:w-96" />
        <Skeleton className="h-4 w-60 sm:w-80" />
      </div>

      {/* ── Metric Row Skeleton ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-[#111215] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD5] py-2 sm:py-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-3 sm:px-6 py-3 sm:py-2 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* ── Main Grid Skeleton ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3: Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick banner */}
          <div className="border border-[#111215] p-5 sm:p-6 bg-white space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <Skeleton className="h-5 w-16 ml-auto" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1/3: Spotlights & Guide */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D8D1C3] p-5 sm:p-6 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="bg-white border border-[#D8D1C3] p-5 sm:p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>

      </div>

    </div>
  );
}
