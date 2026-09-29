import { Skeleton } from '@/components/ui/Skeleton';

export default function RefundLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#111215] animate-fade-in font-mono-code">
      {/* Header */}
      <header className="border-b border-[#E5DFD5] px-5 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-24" />
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-10 py-14 sm:py-20 space-y-12">
        {/* Page Header */}
        <div className="pb-10 border-b border-[#E5DFD5] space-y-4">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-72 sm:w-88" />
          <Skeleton className="h-3 w-72" />
        </div>

        {/* Document Sections */}
        <div className="space-y-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-5 w-48 sm:w-64" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
