import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardSegmentLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-6 space-y-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white border border-[#D8D1C3] p-6 sm:p-8 space-y-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
