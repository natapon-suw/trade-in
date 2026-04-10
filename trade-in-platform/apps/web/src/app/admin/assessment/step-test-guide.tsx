'use client';

import { useEffect, useState } from 'react';
import { getTestGuides, type TestGuide, type TestStep } from '../../../lib/api';

export interface TestStepResult {
  testStepId: string;
  passed: boolean;
}

interface StepTestGuideProps {
  category: string;
  onComplete: (results: TestStepResult[]) => void;
}

export function StepTestGuide({ category, onComplete }: StepTestGuideProps) {
  const [guide, setGuide] = useState<TestGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    getTestGuides(category)
      .then((res) => {
        if (res.data.length > 0) {
          setGuide(res.data[0]);
        } else {
          setError('No test guide found for this category');
        }
      })
      .catch(() => setError('Failed to load test guide'))
      .finally(() => setLoading(false));
  }, [category]);

  const steps = guide?.steps ?? [];
  const allAnswered = steps.length > 0 && steps.every((s) => s.id in results);

  const setResult = (stepId: string, passed: boolean) => {
    setResults((prev) => ({ ...prev, [stepId]: passed }));
  };

  const handleContinue = () => {
    const mapped = steps.map((s) => ({
      testStepId: s.id,
      passed: results[s.id] ?? false,
    }));
    onComplete(mapped);
  };

  if (loading) return <p className="text-sm text-gray-500">Loading test guide...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Step 3: Follow Test Guide
      </h2>
      {guide && (
        <p className="text-sm text-gray-600">Guide: {guide.name}</p>
      )}

      <div className="space-y-3">
        {steps
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => (
            <TestStepCard
              key={step.id}
              step={step}
              result={results[step.id]}
              onResult={(passed) => setResult(step.id, passed)}
            />
          ))}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!allAnswered}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}

function TestStepCard({
  step,
  result,
  onResult,
}: {
  step: TestStep;
  result: boolean | undefined;
  onResult: (passed: boolean) => void;
}) {
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {step.stepNumber}. {step.title}
          </p>
          {step.description && (
            <p className="mt-1 text-xs text-gray-500">{step.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onResult(true)}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              result === true
                ? 'bg-green-600 text-white'
                : 'border border-green-300 text-green-700 hover:bg-green-50'
            }`}
          >
            Pass
          </button>
          <button
            type="button"
            onClick={() => onResult(false)}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              result === false
                ? 'bg-red-600 text-white'
                : 'border border-red-300 text-red-700 hover:bg-red-50'
            }`}
          >
            Fail
          </button>
        </div>
      </div>
    </div>
  );
}
