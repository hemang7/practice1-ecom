import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <span className="text-2xl text-amber-700" aria-hidden="true">
          ×
        </span>
      </div>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment cancelled</h1>
      <p className="mt-3 text-slate-600">
        Your payment was not completed. No charges were made — your cart is still saved.
      </p>

      <Link
        href="/cart"
        className="mt-8 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Return to Cart
      </Link>
    </div>
  );
}
