'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductDetail, type BuyerProductDetail } from '../../../lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<BuyerProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getProductDetail(id);
        setProduct(data);
      } catch {
        setError('Product not found or no longer available.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <p className="py-12 text-center text-gray-400">Loading…</p>;
  }

  if (error || !product) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">{error || 'Product not found.'}</p>
        <button
          type="button"
          onClick={() => router.push('/browse')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/browse')}
        className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        ← Back to Browse
      </button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Photo Gallery */}
        <div>
          <div className="mb-3 flex h-80 items-center justify-center rounded-lg bg-gray-100">
            {product.photos.length > 0 ? (
              <img
                src={product.photos[activePhoto]?.url}
                alt={`${product.brand} ${product.model}`}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <span className="text-gray-400">No photos available</span>
            )}
          </div>
          {product.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhoto(idx)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                    idx === activePhoto
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            {product.brand} {product.model}
          </h1>
          <p className="mb-4 text-sm text-gray-500">{product.category}</p>

          <p className="mb-4 text-3xl font-bold text-green-700">
            ${product.price.toFixed(2)}
          </p>

          <div className="mb-6">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              Condition: {product.conditionGrade}
            </span>
          </div>

          {/* Test Summary */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Test Summary
            </h2>
            <div className="flex gap-4">
              <span className="text-sm text-green-600">
                ✓ {product.testSummary.passed} passed
              </span>
              <span className="text-sm text-red-600">
                ✗ {product.testSummary.failed} failed
              </span>
            </div>
          </div>

          {/* Defect Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Defect Summary
            </h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{product.defectSummary.count} defect(s)</span>
              {product.defectSummary.count > 0 && (
                <span>
                  Avg severity: {product.defectSummary.averageSeverity}/5
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
