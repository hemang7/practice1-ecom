'use client';

import { useState, type FormEvent } from 'react';
import { useCart } from '@/components/cart-context';
import { formatMoney } from '@/lib/money';

export default function OrderSummaryPage() {
  const { items, subtotal, shipping, tax, total, isReady } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const proceedToPayment = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    if (!name || !email || !address) {
      setError('Please fill in all customer details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: { name, email, address },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? 'Failed to start checkout.');
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return <div className="rounded-2xl bg-white p-6 shadow-sm">Loading order summary...</div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order summary</h1>
          <p className="mt-2 text-slate-600">Review your items and proceed to secure payment.</p>
        </div>

        <form
          onSubmit={proceedToPayment}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={name} onChange={setName} placeholder="Jane Doe" />
            <Field label="Email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" />
          </div>
          <Field
            label="Shipping address"
            value={address}
            onChange={setAddress}
            placeholder="123 Main St, Bloomington, IN"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Redirecting to payment...' : 'Proceed to Payment'}
          </button>
        </form>
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Payment breakdown</h2>
        <SummaryRow label="Items" value={String(items.reduce((sum, item) => sum + item.quantity, 0))} />
        <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />
        <SummaryRow label="Shipping" value={formatMoney(shipping)} />
        <SummaryRow label="Tax" value={formatMoney(tax)} />
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-900"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
