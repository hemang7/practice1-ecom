import { ProductBrowser } from '@/components/product-browser';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Simple, functional storefront
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          A clean Next.js 14 ecommerce starter
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Browse products, search by name, filter by category, add them to your cart, and review an order summary before placing an order.
        </p>
      </section>

      <ProductBrowser />
    </div>
  );
}