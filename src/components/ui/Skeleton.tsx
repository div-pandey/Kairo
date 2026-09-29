import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  subtle?: boolean;
}

export function Skeleton({ className, subtle, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        subtle ? 'skeleton-shimmer-subtle' : 'skeleton-shimmer',
        'rounded-none border border-transparent',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
