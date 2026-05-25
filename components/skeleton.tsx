type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <section className="mt-6 border-t border-slate-200 pt-6">
      <Skeleton className="h-6 w-48" />
      <ul className="mt-4 space-y-4">
        {[1, 2, 3].map((key) => (
          <li key={key} className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  );
}
