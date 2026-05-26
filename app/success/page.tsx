'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/components/cart-context';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function saveOrder() {
      setIsSaving(true);

      try {
        if (sessionId) {
          await fetch('/api/stripe-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });
        }
      } catch {
        // Fail silently for now.
      } finally {
        if (!cancelled) {
          clearCart();
          setIsSaving(false);
        }
      }
    }

    saveOrder();

    return () => {
      cancelled = true;
    };
  }, [clearCart, sessionId]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-8 w-8 text-green-700"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-bold text-green-900">Payment successful!</h1>
      <p className="mt-3 text-slate-600">
        Thank you for your order. Your payment was processed successfully.
        {isSaving ? ' Saving your order...' : ''}
      </p>

      {sessionId ? (
        <p className="mt-4 break-all text-sm text-slate-500">
          Session ID: <span className="font-mono text-slate-700">{sessionId}</span>
        </p>
      ) : null}

      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">Loading confirmation...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
