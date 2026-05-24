'use client';

import Image from 'next/image';
import { useCart } from './cart-context';
import type { CartItem } from '@/lib/types';
import { formatMoney } from '@/lib/money';

export function CartItemRow({ item }: { item: CartItem }) {
  const { setQuantity, removeItem } = useCart();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-slate-600">{formatMoney(item.price)} each</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Qty
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => setQuantity(item.id, Number(e.target.value))}
            className="w-20 rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>
        <div className="text-sm font-medium">{formatMoney(item.price * item.quantity)}</div>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
