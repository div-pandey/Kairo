import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      
      {/* Header Skeleton */}
      <div className="border-b border-[#E5DFD5] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-10 w-32 shrink-0" />
      </div>

      {/* Orders List Skeleton */}
      <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-28" />
                <span className="text-[#CFC7BB]">·</span>
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F0EBE3]">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
