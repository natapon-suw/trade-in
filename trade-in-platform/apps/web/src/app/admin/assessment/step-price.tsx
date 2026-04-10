'use client';

import { useState } from 'react';
import { addToStock, type Assessment } from '../../../lib/api';

interface StepPriceProps {
  assessment: Assessment;
  onStocked: () => void;
}

export function StepPrice({ assessment, onStocked }: StepPriceProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const basePrice = assessment.basePrice ?? assessment.productModel?.basePrice ?? 0;
  const testDeduction = assessment.testDeduction ?? 0;
  const defectDeduction = assessment.defectDeduction ?? 0;
  const finalPrice = assessment.finalPrice ?? basePrice - testDeduction - defectDeduction;

  const handleAddToStock = async () => {
    setLoading(true);
    setError('');
    try {
      await addToStock(assessment.id);
      onStocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Step 7: Price Breakdown
      </h2>

      <div className="rounded-md border border-gray-200 divide-y divide-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-600">Base Price</span>
          <span className="text-sm font-medium text-gray-900">
            ${basePrice.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-600">Test Deductions</span>
          <span className="text-sm font-medium text-red-600">
            -${testDeduction.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-600">Defect Deductions</span>
          <span className="text-sm font-medium text-red-600">
            -${defectDeduction.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between bg-blue-50 px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">Final Price</span>
          <span className="text-lg font-bold text-blue-700">
            ${finalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAddToStock}
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add to Stock'}
      </button>
    </div>
  );
}
