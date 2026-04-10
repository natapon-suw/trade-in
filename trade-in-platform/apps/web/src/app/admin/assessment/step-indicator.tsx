'use client';

const STEP_LABELS = [
  'Customer',
  'Product',
  'Test Guide',
  'Results',
  'Photos',
  'Defects',
  'Price',
  'Complete',
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex min-w-[600px] items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                        ? 'border-2 border-blue-600 bg-white text-blue-600'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : step}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {step < STEP_LABELS.length && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
