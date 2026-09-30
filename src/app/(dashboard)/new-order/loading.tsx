import { Skeleton } from '@/components/ui/Skeleton';

export default function NewOrderLoading() {
  return (
    <div className="px-4 py-6 sm:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-mono-code animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-5 sm:pb-6 space-y-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Step Sequence Tabs Skeleton */}
      <div className="flex border-b border-[#111215] pb-3 gap-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Upload Dropzone Skeleton */}
      <div className="border border-dashed border-[#CFC7BB] p-10 bg-white flex flex-col items-center justify-center space-y-3">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-3 w-80" />
      </div>
    </div>
  );
}
