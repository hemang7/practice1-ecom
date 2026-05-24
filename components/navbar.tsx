'use client';

import Link from 'next/link';
import { useCart } from './cart-context';

export function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Simple Shop
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-slate-600">
            Products
          </Link>
          <Link href="/cart" className="hover:text-slate-600">
            Cart ({itemCount})
          </Link>
          <Link href="/order-summary" className="hover:text-slate-600">
            Order Summary
          </Link>
        </nav>
      </div>
    </header>
  );
}
