'use client';

import Image from 'next/image';
import { useCart } from './cart-context';
import type { Product } from '@/lib/types';
import { formatMoney } from '@/lib/money';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-56 w-full">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {product.category}
          </span>
          <span className="text-lg font-semibold">{formatMoney(product.price)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{product.description}</p>
        </div>
        <button
          type="button"
          onClick={() => addItem(product)}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
