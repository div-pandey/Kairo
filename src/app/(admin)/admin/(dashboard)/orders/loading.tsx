import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminOrdersLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      
      {/* Header Skeleton */}
      <div className="border-b border-[#E5DFD5] pb-6 space-y-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-52" />
      </div>

      {/* Orders Table Skeleton */}
      <div className="bg-white border border-[#D8D1C3] divide-y divide-[#E5DFD5]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-36 hidden md:block" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-32" />
                <span className="text-[#CFC7BB]">·</span>
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F0EBE3]">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
