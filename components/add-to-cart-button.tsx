'use client';

import { useCart } from '@/components/cart-context';
import { canAddToCart, getRemainingStock, isOutOfStock } from '@/lib/stock';
import type { Product } from '@/lib/types';

type AddToCartButtonProps = {
  product: Product;
  className?: string;
  fullWidth?: boolean;
};

export function AddToCartButton({ product, className = '', fullWidth = false }: AddToCartButtonProps) {
  const { addItem, getCartQuantity } = useCart();
  const cartQuantity = getCartQuantity(product.id);
  const outOfStock = isOutOfStock(product);
  const remaining = getRemainingStock(product, cartQuantity);
  const canAdd = canAddToCart(product, cartQuantity);

  const baseClass = fullWidth ? 'w-full' : '';
  const disabledClass = 'cursor-not-allowed bg-slate-300 text-slate-600 hover:bg-slate-300';
  const activeClass = 'bg-slate-900 text-white hover:bg-slate-700';

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`rounded-xl px-4 py-3 text-sm font-semibold ${disabledClass} ${baseClass} ${className}`}
      >
        Out of stock
      </button>
    );
  }

  return (
    <div className={fullWidth ? 'w-full space-y-2' : 'space-y-2'}>
      {!canAdd && remaining === 0 ? (
        <p className="text-sm text-amber-700">All available stock is in your cart.</p>
      ) : null}
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => addItem(product)}
        className={`rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-100 ${
          canAdd ? activeClass : disabledClass
        } ${baseClass} ${className}`}
      >
        {canAdd ? 'Add to cart' : 'Max quantity in cart'}
      </button>
    </div>
  );
}
