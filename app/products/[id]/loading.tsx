import { ProductDetailSkeleton } from '@/components/skeleton';

export default function ProductLoadingPage() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <ProductDetailSkeleton />
    </div>
  );
}
