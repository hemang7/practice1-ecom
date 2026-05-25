import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-slate-600">This product may have been removed or the link is incorrect.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
      >
        Back to products
      </Link>
    </div>
  );
}
