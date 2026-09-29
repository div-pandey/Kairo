import { Skeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col font-mono-code animate-fade-in">
      {/* Top bar */}
      <div className="h-16 sm:h-20 border-b border-[#E5DFD5] px-5 sm:px-12 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <div className="hidden sm:flex gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Hero skeleton */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-12 py-12 sm:py-20 space-y-8">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-14 sm:h-20 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-1/2 max-w-md" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-36" />
        </div>
      </div>
    </div>
  );
}
