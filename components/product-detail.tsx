'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductRecommendations } from '@/components/product-recommendations';
import { StockStatus } from '@/components/stock-status';
import { formatMoney } from '@/lib/money';
import type { Product } from '@/lib/types';

export function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        ← Back to products
      </Link>

      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />
        </div>

        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-2xl font-semibold">{formatMoney(product.price)}</p>
          <StockStatus quantity={product.stockQuantity} />
          <p className="text-base leading-7 text-slate-600">{product.description}</p>
          <AddToCartButton product={product} />
          <ProductRecommendations product={product} />
        </div>
      </div>
    </div>
  );
}
