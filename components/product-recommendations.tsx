'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RecommendationsSkeleton } from '@/components/skeleton';
import type { Product } from '@/lib/types';

type RecommendationProduct = {
  name: string;
  category: string;
  description: string;
};

type Recommendation = {
  name: string;
  reason: string;
};

function toRecommendationProduct(product: Product): RecommendationProduct {
  return {
    name: product.name,
    category: product.category,
    description: product.description,
  };
}

export function ProductRecommendations({ product }: { product: Product }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [productsByName, setProductsByName] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setIsLoading(true);

      try {
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          return;
        }

        const productsData = (await productsResponse.json()) as { products: Product[] };
        const allProducts = productsData.products ?? [];
        const otherProducts = allProducts.filter((entry) => entry.id !== product.id);

        if (otherProducts.length === 0) {
          return;
        }

        const byName = Object.fromEntries(otherProducts.map((entry) => [entry.name, entry]));

        const recommendationsResponse = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentProduct: toRecommendationProduct(product),
            allProducts: otherProducts.map(toRecommendationProduct),
          }),
        });

        if (!recommendationsResponse.ok) {
          return;
        }

        const recommendationsData = (await recommendationsResponse.json()) as {
          recommendations: Recommendation[];
        };

        if (!cancelled) {
          setProductsByName(byName);
          setRecommendations(recommendationsData.recommendations ?? []);
        }
      } catch {
        // Fail silently — hide recommendations section.
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [product.id, product.name, product.category, product.description]);

  if (isLoading) {
    return <RecommendationsSkeleton />;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 border-t border-slate-200 pt-6">
      <h2 className="text-lg font-semibold">You might also like</h2>
      <ul className="mt-4 space-y-4">
        {recommendations.map((recommendation) => {
          const recommendedProduct = productsByName[recommendation.name];

          return (
            <li
              key={recommendation.name}
              className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              {recommendedProduct ? (
                <Link
                  href={`/products/${recommendedProduct.id}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={recommendedProduct.image}
                    alt={recommendedProduct.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </Link>
              ) : (
                <div className="h-20 w-20 shrink-0 rounded-lg bg-slate-200" />
              )}

              <div className="min-w-0 flex-1">
                {recommendedProduct ? (
                  <Link
                    href={`/products/${recommendedProduct.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {recommendation.name}
                  </Link>
                ) : (
                  <p className="font-medium text-slate-900">{recommendation.name}</p>
                )}
                <p className="mt-1 text-sm leading-6 text-slate-600">{recommendation.reason}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
