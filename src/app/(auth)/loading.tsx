import { Skeleton } from '@/components/ui/Skeleton';

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white border border-[#D8D1C3] shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] space-y-6 font-mono-code animate-fade-in">
      <div className="space-y-2 border-b border-[#E5DFD5] pb-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-56" />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-11 w-full pt-2" />
      </div>

      <div className="pt-2 border-t border-[#E5DFD5] flex justify-center">
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
