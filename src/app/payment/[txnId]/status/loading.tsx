import { Skeleton } from '@/components/ui/Skeleton';

export default function PaymentStatusLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center px-4 py-12 font-mono-code animate-fade-in">
      <div className="w-full max-w-md">
        {/* Kairo wordmark */}
        <div className="text-center mb-8 space-y-1">
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>

        {/* Status Card Skeleton */}
        <div className="bg-white border border-[#D8D1C3] shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] p-8 relative space-y-6">
          {/* Corner marks */}
          <span className="absolute top-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute top-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute bottom-2 left-2 text-[10px] text-[#B5ADA0] select-none">+</span>
          <span className="absolute bottom-2 right-2 text-[10px] text-[#B5ADA0] select-none">+</span>

          {/* Icon & Title */}
          <div className="text-center space-y-3 py-2">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-44 mx-auto" />
            <Skeleton className="h-3 w-60 mx-auto" />
          </div>

          {/* Receipt Info Box */}
          <div className="bg-[#FBF9F5] border border-[#E5DFD5] p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Action button */}
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
