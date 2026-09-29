import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminPricingLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in font-mono-code">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3 w-80" />
        </div>
        <Skeleton className="h-8 w-36 self-start sm:self-auto" />
      </div>

      {/* Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Black & White Card */}
        <div className="bg-white border border-[#D8D1C3] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-11 shrink-0" />
              <Skeleton className="h-11 w-11 shrink-0" />
            </div>
          </div>

          <Skeleton className="h-7 w-52" />
        </div>

        {/* Colour Card */}
        <div className="bg-white border border-[#D8D1C3] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-11 shrink-0" />
              <Skeleton className="h-11 w-11 shrink-0" />
            </div>
          </div>

          <Skeleton className="h-7 w-52" />
        </div>
      </div>

      {/* Simulator Widget */}
      <div className="bg-white border border-[#D8D1C3] p-6 space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-72" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-16 w-full" />
      </div>

      {/* Policy Card */}
      <div className="bg-[#F3EFE8] border border-[#CFC7BB] p-5 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
