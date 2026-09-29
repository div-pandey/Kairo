import { Skeleton } from '@/components/ui/Skeleton';

export default function NewOrderLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      
      {/* Header Skeleton */}
      <div className="border-b border-[#E5DFD5] pb-5 sm:pb-6 space-y-2">
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Step Sequence Tabs Skeleton */}
      <div className="flex border-b border-[#111215] pb-3 gap-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Dropzone Box Skeleton */}
      <div className="border border-dashed border-[#CFC7BB] bg-white p-8 sm:p-14 flex flex-col items-center justify-center gap-4 text-center">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-3 w-80 max-w-full" />
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-11 w-44" />
      </div>

    </div>
  );
}
