'use client';

import { CartItemRow } from '@/components/cart-item-row';
import { CartSummary } from '@/components/cart-summary';
import { useCart } from '@/components/cart-context';

export default function CartPage() {
  const { items, isReady } = useCart();

  if (!isReady) {
    return <div className="rounded-2xl bg-white p-6 shadow-sm">Loading cart...</div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
          <p className="mt-2 text-slate-600">Review items, change quantities, or remove products.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-medium">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <CartSummary />
      </div>
    </div>
  );
}
