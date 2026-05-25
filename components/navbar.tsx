'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useCart } from './cart-context';

export function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, isReady, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Simple Shop
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium sm:gap-4">
          <Link href="/" className="hover:text-slate-600">
            Products
          </Link>
          <Link href="/cart" className="hover:text-slate-600">
            Cart ({itemCount})
          </Link>
          <Link href="/order-summary" className="hover:text-slate-600">
            Order Summary
          </Link>
          {isReady && user ? (
            <>
              <Link href="/orders" className="hover:text-slate-600">
                Order History
              </Link>
              <span className="max-w-[10rem] truncate text-slate-500 sm:max-w-xs" title={user.email ?? undefined}>
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
              >
                Log out
              </button>
            </>
          ) : isReady ? (
            <>
              <Link href="/login" className="hover:text-slate-600">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
