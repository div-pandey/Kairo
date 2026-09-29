import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      
      {/* Header Skeleton */}
      <div className="border-b border-[#E5DFD5] pb-7 space-y-2">
        <Skeleton className="h-3 w-52" />
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white border border-[#D8D1C3] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-28" />
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3.5 border border-[#E5DFD5] bg-[#FBF9F5] space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
