'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStockItemDetail, type StockItemDetail } from '../../../../lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  SOLD: 'bg-blue-100 text-blue-800',
  REMOVED: 'bg-gray-100 text-gray-600',
};

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<StockItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getStockItemDetail(id);
        setItem(data);
      } catch {
        setError('Failed to load stock item details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error) return <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  if (!item) return <p className="text-sm text-gray-500">Stock item not found.</p>;

  const assessment = item.assessment;
  const model = item.productModel ?? assessment?.productModel;
  const photos = assessment?.photos ?? [];
  const testResults = assessment?.testResults ?? [];
  const defects = assessment?.defects ?? [];

  const passCount = testResults.filter((r) => r.passed).length;
  const failCount = testResults.length - passCount;

  return (
    <div>
      <button
        onClick={() => router.push('/admin/stock')}
        className="mb-4 text-sm text-blue-600 hover:text-blue-800"
      >
        ← Back to Stock
      </button>

      {/* Product Info */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {model?.brand} {model?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {model?.category} · Stock ID: {item.id.slice(0, 8)}
            </p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {item.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Price</p>
            <p className="text-lg font-semibold text-gray-900">${item.price.toLocaleString()}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Condition Grade</p>
            <p className="text-lg font-semibold text-gray-900">{item.conditionGrade}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Date Added</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Photos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-md border border-gray-200">
                <img
                  src={photo.url.startsWith('http') ? photo.url : `${BASE_URL}${photo.url}`}
                  alt="Assessment photo"
                  className="h-32 w-full object-cover"
                />
                <div className="px-2 py-1 text-xs text-gray-500">
                  {photo.uploadedVia === 'MOBILE' ? '📱 Mobile' : '💻 PC'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Test Results</h2>
          <div className="mb-3 flex gap-4 text-sm">
            <span className="text-green-600">✓ {passCount} passed</span>
            <span className="text-red-600">✗ {failCount} failed</span>
          </div>
          <div className="space-y-2">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                  result.passed
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <span className="text-gray-900">
                  {result.passed ? '✓' : '✗'} Step {result.testStepId.slice(0, 8)}
                </span>
                {result.notes && (
                  <span className="text-gray-500">{result.notes}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defects */}
      {defects.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Defects</h2>
          <div className="space-y-2">
            {defects.map((defect) => (
              <div
                key={defect.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <span className="text-gray-900">
                  Defect {defect.defectItemId.slice(0, 8)}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    defect.severity >= 4
                      ? 'bg-red-100 text-red-800'
                      : defect.severity >= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    Severity {defect.severity}/5
                  </span>
                  {defect.notes && (
                    <span className="text-gray-500">{defect.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Price Breakdown */}
      {assessment && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Price Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Price</span>
              <span className="text-gray-900">${assessment.basePrice?.toLocaleString() ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Test Deduction</span>
              <span className="text-red-600">
                {assessment.testDeduction != null ? `-$${Math.abs(assessment.testDeduction).toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Defect Deduction</span>
              <span className="text-red-600">
                {assessment.defectDeduction != null ? `-$${Math.abs(assessment.defectDeduction).toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <span className="text-gray-900">Final Price</span>
              <span className="text-gray-900">${assessment.finalPrice?.toLocaleString() ?? '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
