'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, mailto, tel, anchor jumps on same page, or new tabs
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.target === '_blank' ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      // Check if navigating to a different page
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#F3EFE8] overflow-hidden pointer-events-none">
      <div className="h-full bg-[#1D4ED8] animate-progress origin-left" />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
