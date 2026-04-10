'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchProductModels, type ProductModel } from '../../../lib/api';

interface StepProductProps {
  onSelect: (model: ProductModel) => void;
}

export function StepProduct({ onSelect }: StepProductProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchProductModels(q);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Step 2: Select Product Model
      </h2>

      <input
        type="text"
        placeholder="Search by brand or model name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {loading && <p className="text-sm text-gray-500">Searching...</p>}

      {results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="rounded-md border border-gray-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">
                {m.brand} {m.name}
              </p>
              <p className="text-xs text-gray-500">Category: {m.category}</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">
                Base: ${m.basePrice.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
