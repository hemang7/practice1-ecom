'use client';

import Link from 'next/link';
import { useCart } from './cart-context';
import { formatMoney } from '@/lib/money';

export function CartSummary() {
  const { subtotal, shipping, tax, total, itemCount } = useCart();

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Summary</h2>
      <div className="mt-4 space-y-3 text-sm">
        <Row label="Items" value={String(itemCount)} />
        <Row label="Subtotal" value={formatMoney(subtotal)} />
        <Row label="Shipping" value={formatMoney(shipping)} />
        <Row label="Tax" value={formatMoney(tax)} />
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>
      <Link
        href="/order-summary"
        className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Go to order summary
      </Link>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
