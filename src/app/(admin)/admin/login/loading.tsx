import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoginLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between px-4 py-6 sm:p-12 font-mono-code animate-fade-in">
      {/* Top bar */}
      <header className="max-w-lg mx-auto w-full flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-28" />
      </header>

      {/* Main card */}
      <main className="my-auto py-8 flex justify-center">
        <div className="w-full max-w-lg bg-white border border-[#D8D1C3] p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(25,20,15,0.06)] space-y-6">
          <div className="border-b border-[#E5DFD5] pb-5 space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-11 w-full pt-2" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center">
        <Skeleton className="h-3 w-56 mx-auto" />
      </footer>
    </div>
  );
}
