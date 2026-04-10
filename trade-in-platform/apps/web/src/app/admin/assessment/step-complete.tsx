'use client';

interface StepCompleteProps {
  onStartNew: () => void;
}

export function StepComplete({ onStartNew }: StepCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        Assessment Complete!
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        The product has been assessed, priced, and added to stock.
      </p>
      <button
        type="button"
        onClick={onStartNew}
        className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
      >
        Start New Assessment
      </button>
    </div>
  );
}
