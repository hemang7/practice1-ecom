'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { StockStatus } from '@/components/stock-status';
import type { Product } from '@/lib/types';
import { formatMoney } from '@/lib/money';

export function ProductCard({ product }: { product: Product }) {
  const productHref = `/products/${product.id}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link href={productHref} className="relative block h-56 w-full">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {product.category}
          </span>
          <span className="text-lg font-semibold">{formatMoney(product.price)}</span>
        </div>
        <div>
          <Link href={productHref}>
            <h3 className="text-lg font-semibold hover:text-slate-600">{product.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
          <div className="mt-2">
            <StockStatus quantity={product.stockQuantity} />
          </div>
        </div>
        <AddToCartButton product={product} fullWidth />
      </div>
    </article>
  );
}
