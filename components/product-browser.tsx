'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { ProductGridSkeleton } from '@/components/skeleton';
import type { Product } from '@/lib/types';

export function ProductBrowser() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to load products.');
        }

        const data = (await response.json()) as { products: Product[] };
        if (!cancelled) {
          setProducts(data.products);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Something went wrong.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => ['All categories', ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === 'All categories' || product.category === category;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-slate-600">Loading catalog...</p>
        </div>
        <ProductGridSkeleton />
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        {loadError}
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-slate-600">
            Search by name or description, or narrow results by category.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <label className="w-full sm:w-64">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900"
            />
          </label>

          <label className="w-full sm:w-56">
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
        <span>
          {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
        </span>

        {(search || category !== 'All categories') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All categories');
            }}
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No products match your search.
        </div>
      )}
    </section>
  );
}
