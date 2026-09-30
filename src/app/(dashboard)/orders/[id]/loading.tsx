import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-28 shrink-0" />
      </div>

      {/* Status Spotlight Card */}
      <div className="bg-white border border-[#D8D1C3] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      {/* Order Items Ledger */}
      <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
        <div className="p-4 bg-[#FBF9F5]">
          <Skeleton className="h-4 w-36" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
