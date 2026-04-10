'use client';

import { useState } from 'react';
import { submitTestResults } from '../../../lib/api';
import type { TestStepResult } from './step-test-guide';

interface StepTestResultsProps {
  assessmentId: string;
  results: TestStepResult[];
  onSubmitted: () => void;
}

export function StepTestResults({
  assessmentId,
  results,
  onSubmitted,
}: StepTestResultsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await submitTestResults(assessmentId, results);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Step 4: Submit Test Results
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{passed}</p>
          <p className="text-sm text-green-600">Passed</p>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{failed}</p>
          <p className="text-sm text-red-600">Failed</p>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Pass rate:{' '}
          <span className="font-semibold">
            {results.length > 0
              ? Math.round((passed / results.length) * 100)
              : 0}
            %
          </span>
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Test Results'}
      </button>
    </div>
  );
}
