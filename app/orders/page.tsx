'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { formatMoney } from '@/lib/money';
import type { Order } from '@/lib/types';

export default function OrderHistoryPage() {
  const { user, isReady } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isReady || !user) {
      if (isReady && !user) {
        setIsLoading(false);
      }
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/orders');
        if (response.status === 401) {
          throw new Error('You must be logged in to view order history.');
        }
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(payload?.message ?? 'Failed to load orders.');
        }

        const data = (await response.json()) as { orders: Order[] };
        if (!cancelled) {
          setOrders(data.orders);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [isReady, user]);

  if (!isReady || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order history</h1>
          <p className="mt-2 text-slate-600">Loading your orders...</p>
        </div>
        <div className="space-y-4">
          {[1, 2].map((key) => (
            <div
              key={key}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-56 rounded bg-slate-200" />
              <div className="mt-6 h-4 w-full rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order history</h1>
        <p className="mt-2 text-slate-600">Orders placed with {user.email}</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No orders yet</p>
          <p className="mt-2 text-slate-600">
            When you place your first order, it will show up here. Browse the catalog and checkout when
            you are ready.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <li
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">Order {order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {itemCount} item{itemCount === 1 ? '' : 's'} · Shipped to {order.customer.address}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{formatMoney(order.total)}</p>
                </div>

                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatMoney(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
