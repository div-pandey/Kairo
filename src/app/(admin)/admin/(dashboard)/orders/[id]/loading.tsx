import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminOrderDetailLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      
      {/* Back link */}
      <div>
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Header */}
      <div className="border-b border-[#111215] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-3 w-40" />
        </div>

        <div className="sm:text-right shrink-0 space-y-2">
          <Skeleton className="h-6 w-24 ml-auto" />
          <Skeleton className="h-8 w-28 ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Files to print & download */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#D8D1C3]">
            <div className="px-5 py-3.5 border-b border-[#E5DFD5] bg-[#F5F1EA] flex justify-between items-center">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>

            <div className="divide-y divide-[#E5DFD5]">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-52" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-9 w-28 shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FBF9F5] border border-[#E5DFD5] p-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F5F1EA] border-t border-[#E5DFD5] flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>

        {/* Right: Student Profile & Status Action */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D8D1C3] p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="bg-white border border-[#D8D1C3] p-5 space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

      </div>

    </div>
  );
}
