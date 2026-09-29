import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      
      {/* Back link skeleton */}
      <div>
        <Skeleton className="h-4 w-36" />
      </div>

      {/* The Physical Requisition Sheet Skeleton */}
      <div className="bg-white border border-[#D8D1C3] p-4 sm:p-10 shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] relative space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#111215] pb-5 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-3 w-36" />
          </div>

          <div className="sm:text-right shrink-0 space-y-2">
            <Skeleton className="h-3 w-20 ml-auto" />
            <Skeleton className="h-6 w-28 ml-auto" />
          </div>
        </div>

        {/* Lifecycle Tracker Steps */}
        <div className="pb-6 sm:pb-8 border-b border-[#E5DFD5] space-y-4">
          <Skeleton className="h-3 w-28" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-2.5 sm:p-3 border border-[#E5DFD5] bg-[#FBF9F5] space-y-1.5">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Requisition Items */}
        <div className="space-y-4">
          <Skeleton className="h-3 w-44" />
          <div className="border border-[#E5DFD5] divide-y divide-[#E5DFD5]">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                  <Skeleton className="h-3 w-72" />
                </div>
                <div className="sm:text-right shrink-0 space-y-1">
                  <Skeleton className="h-3 w-16 ml-auto" />
                  <Skeleton className="h-5 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Total Sheet */}
        <div className="p-4 bg-[#F5F1EA] border border-[#E5DFD5] flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-24" />
        </div>

      </div>

    </div>
  );
}
