'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browseProducts, type BuyerProduct } from '../../lib/api';

const CATEGORIES = ['', 'LAPTOP', 'PC', 'MACBOOK'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  '': 'All Categories',
  LAPTOP: 'Laptop',
  PC: 'PC',
  MACBOOK: 'MacBook',
};

export default function BrowsePage() {
  const router = useRouter();
  const [products, setProducts] = useState<BuyerProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await browseProducts(
        category || undefined,
        page,
        pageSize,
      );
      setProducts(res.data);
      setTotal(res.total);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, page, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Available Products</h1>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading…</p>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-gray-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => router.push(`/browse/${product.id}`)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex h-40 items-center justify-center rounded-md bg-gray-100">
                {product.photoUrl ? (
                  <img
                    src={product.photoUrl}
                    alt={`${product.brand} ${product.model}`}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-400">No photo</span>
                )}
              </div>
              <p className="font-semibold text-gray-900">
                {product.brand} {product.model}
              </p>
              <p className="mt-1 text-lg font-bold text-green-700">
                ${product.price.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {product.conditionGrade}
                </span>
                <span className="text-xs text-gray-400">
                  {product.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
