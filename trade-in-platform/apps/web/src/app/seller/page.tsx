'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  sellerSearchModels,
  sellerPriceCheck,
  ApiError,
  type ProductModel,
  type PriceCheckResult,
} from '../../lib/api';

const COMMON_DEFECTS = [
  { id: 'defect-screen', name: 'Screen Damage' },
  { id: 'defect-keyboard', name: 'Keyboard Issue' },
  { id: 'defect-battery', name: 'Battery Degradation' },
  { id: 'defect-body', name: 'Body Damage' },
  { id: 'defect-port', name: 'Port Malfunction' },
];

type Step = 'select-model' | 'select-defects' | 'result';

export default function SellerPriceCheckPage() {
  const [step, setStep] = useState<Step>('select-model');

  // Model search
  const [query, setQuery] = useState('');
  const [models, setModels] = useState<ProductModel[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ProductModel | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Defects
  const [defects, setDefects] = useState<Record<string, { enabled: boolean; severity: number }>>(() =>
    Object.fromEntries(COMMON_DEFECTS.map((d) => [d.id, { enabled: false, severity: 3 }])),
  );

  // Result
  const [result, setResult] = useState<PriceCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced search
  const searchModels = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await sellerSearchModels(q);
      setModels(res.data);
    } catch {
      setModels([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setModels([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchModels(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchModels]);

  function handleSelectModel(model: ProductModel) {
    setSelectedModel(model);
    setQuery('');
    setModels([]);
    setStep('select-defects');
  }

  async function handleSubmit() {
    if (!selectedModel) return;
    setError('');
    setLoading(true);
    try {
      const activeDefects = Object.entries(defects)
        .filter(([, v]) => v.enabled)
        .map(([id, v]) => ({ defectItemId: id, severity: v.severity }));
      const res = await sellerPriceCheck(selectedModel.id, activeDefects);
      setResult(res);
      setStep('result');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to get price estimate');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep('select-model');
    setSelectedModel(null);
    setResult(null);
    setError('');
    setQuery('');
    setModels([]);
    setDefects(
      Object.fromEntries(COMMON_DEFECTS.map((d) => [d.id, { enabled: false, severity: 3 }])),
    );
  }

  function toggleDefect(id: string) {
    setDefects((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  }

  function setSeverity(id: string, severity: number) {
    setDefects((prev) => ({
      ...prev,
      [id]: { ...prev[id], severity },
    }));
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Price Check</h1>
      <p className="mb-6 text-sm text-gray-500">
        Get an instant trade-in estimate for your device. No login required.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Step 1: Search & select model */}
      {step === 'select-model' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Step 1: Select Your Device</h2>
          <label htmlFor="model-search" className="mb-1 block text-sm font-medium text-gray-700">
            Search by brand or model name
          </label>
          <input
            id="model-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. MacBook Pro, ThinkPad..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searching && <p className="mt-2 text-xs text-gray-400">Searching…</p>}
          {models.length > 0 && (
            <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
              {models.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectModel(m)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium">{m.brand} {m.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{m.category}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-700">
                      ${m.basePrice.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.length >= 1 && !searching && models.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No models found.</p>
          )}
        </div>
      )}

      {/* Step 2: Defect selection */}
      {step === 'select-defects' && selectedModel && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-lg font-semibold">Step 2: Report Defects</h2>
          <p className="mb-4 text-sm text-gray-500">
            Selected: <span className="font-medium text-gray-700">{selectedModel.brand} {selectedModel.name}</span>
            {' '}— Base price: <span className="font-medium text-green-700">${selectedModel.basePrice.toFixed(2)}</span>
          </p>
          <p className="mb-3 text-sm text-gray-500">Check any defects that apply and set severity (1 = minor, 5 = severe).</p>

          <div className="space-y-3">
            {COMMON_DEFECTS.map((d) => {
              const state = defects[d.id];
              return (
                <div key={d.id} className="flex items-center gap-4 rounded-md border border-gray-100 p-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={state.enabled}
                      onChange={() => toggleDefect(d.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {d.name}
                  </label>
                  {state.enabled && (
                    <div className="ml-auto flex items-center gap-2">
                      <label htmlFor={`severity-${d.id}`} className="text-xs text-gray-500">Severity</label>
                      <input
                        id={`severity-${d.id}`}
                        type="range"
                        min={1}
                        max={5}
                        value={state.severity}
                        onChange={(e) => setSeverity(d.id, Number(e.target.value))}
                        className="h-2 w-24 cursor-pointer accent-blue-600"
                      />
                      <span className="w-4 text-center text-sm font-semibold text-gray-700">{state.severity}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => { setStep('select-model'); setSelectedModel(null); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Calculating…' : 'Get Estimate'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && selectedModel && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Estimated Trade-In Value</h2>
          <p className="mb-1 text-sm text-gray-500">
            {selectedModel.brand} {selectedModel.name}
          </p>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-700">
              ${result.estimatedMin.toFixed(2)} — ${result.estimatedMax.toFixed(2)}
            </span>
          </div>

          <div className="mb-6 space-y-1 text-sm text-gray-600">
            <p>Base price: <span className="font-medium">${result.basePrice.toFixed(2)}</span></p>
            <p>Deductions: <span className="font-medium text-red-600">−${result.deductions.toFixed(2)}</span></p>
            <p>Final estimate: <span className="font-medium">${result.finalEstimate.toFixed(2)}</span></p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Check Another Device
          </button>
        </div>
      )}
    </div>
  );
}
