'use client';

import { useEffect, useState } from 'react';
import {
  getDefectChecklists,
  submitDefects,
  type DefectChecklist,
  type DefectItem,
} from '../../../lib/api';

interface DefectEntry {
  defectItemId: string;
  checked: boolean;
  severity: number;
}

interface StepDefectsProps {
  assessmentId: string;
  category: string;
  onSubmitted: () => void;
}

export function StepDefects({
  assessmentId,
  category,
  onSubmitted,
}: StepDefectsProps) {
  const [checklist, setChecklist] = useState<DefectChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<Record<string, DefectEntry>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDefectChecklists(category)
      .then((res) => {
        if (res.data.length > 0) {
          const cl = res.data[0];
          setChecklist(cl);
          const initial: Record<string, DefectEntry> = {};
          cl.items.forEach((item) => {
            initial[item.id] = {
              defectItemId: item.id,
              checked: false,
              severity: item.defaultSeverity ?? 1,
            };
          });
          setEntries(initial);
        } else {
          setError('No defect checklist found for this category');
        }
      })
      .catch(() => setError('Failed to load defect checklist'))
      .finally(() => setLoading(false));
  }, [category]);

  const toggleCheck = (id: string) => {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id].checked },
    }));
  };

  const setSeverity = (id: string, severity: number) => {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], severity },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const defects = Object.values(entries)
        .filter((e) => e.checked)
        .map((e) => ({ defectItemId: e.defectItemId, severity: e.severity }));
      await submitDefects(assessmentId, defects);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit defects');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading checklist...</p>;
  if (error && !checklist) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Step 6: Defect Checklist
      </h2>
      {checklist && (
        <p className="text-sm text-gray-600">{checklist.name}</p>
      )}

      <div className="space-y-3">
        {checklist?.items.map((item) => (
          <DefectItemRow
            key={item.id}
            item={item}
            entry={entries[item.id]}
            onToggle={() => toggleCheck(item.id)}
            onSeverity={(s) => setSeverity(item.id, s)}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Defects'}
      </button>
    </div>
  );
}

function DefectItemRow({
  item,
  entry,
  onToggle,
  onSeverity,
}: {
  item: DefectItem;
  entry: DefectEntry;
  onToggle: () => void;
  onSeverity: (s: number) => void;
}) {
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={entry.checked}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
          aria-label={`Mark ${item.name} as defective`}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          {item.description && (
            <p className="text-xs text-gray-500">{item.description}</p>
          )}
          {entry.checked && (
            <div className="mt-2">
              <label className="text-xs text-gray-600">
                Severity: {entry.severity}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={entry.severity}
                onChange={(e) => onSeverity(Number(e.target.value))}
                className="mt-1 w-full"
                aria-label={`Severity for ${item.name}`}
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>1 (Minor)</span>
                <span>5 (Severe)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
