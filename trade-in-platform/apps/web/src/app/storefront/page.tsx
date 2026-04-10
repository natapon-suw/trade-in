'use client';

import { useCallback, useEffect, useState } from 'react';
import { browseProducts, type BuyerProduct } from '../../lib/api';

export default function StorefrontPage() {
  const [products, setProducts] = useState<BuyerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchProducts = useCallback(async () => {
    try {
      const res = await browseProducts(undefined, 1, 100);
      setProducts(res.data);
      setLastUpdated(new Date());
    } catch {
      // Keep existing products on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Available Products
      </h1>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading…</p>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          No products available.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-lg"
            >
              <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-gray-700">
                {product.photoUrl ? (
                  <img
                    src={product.photoUrl}
                    alt={`${product.brand} ${product.model}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500">No photo</span>
                )}
              </div>
              <p className="text-lg font-semibold text-white">
                {product.brand} {product.model}
              </p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                ${product.price.toFixed(2)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-block rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-300">
                  {product.conditionGrade}
                </span>
                <span className="text-xs text-gray-400">
                  {product.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </p>
    </div>
  );
}
