'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getTestGuides,
  createTestGuide,
  updateTestGuide,
  type TestGuide,
} from '../../../../lib/api';

const CATEGORIES = ['LAPTOP', 'PC', 'MACBOOK'] as const;

interface StepForm {
  stepNumber: number;
  title: string;
  description: string;
}

interface GuideForm {
  category: string;
  name: string;
  steps: StepForm[];
}

const emptyForm: GuideForm = { category: 'LAPTOP', name: '', steps: [{ stepNumber: 1, title: '', description: '' }] };

export default function TestGuidesPage() {
  const [guides, setGuides] = useState<TestGuide[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuideForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTestGuides(categoryFilter || undefined);
      setGuides(res.data);
    } catch {
      setError('Failed to load test guides');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (guide: TestGuide) => {
    setEditingId(guide.id);
    setForm({
      category: guide.category,
      name: guide.name,
      steps: guide.steps
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((s) => ({ stepNumber: s.stepNumber, title: s.title, description: s.description ?? '' })),
    });
    setShowForm(true);
  };

  const addStep = () => {
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { stepNumber: f.steps.length + 1, title: '', description: '' }],
    }));
  };

  const removeStep = (idx: number) => {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 })),
    }));
  };

  const updateStep = (idx: number, field: keyof StepForm, value: string) => {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        category: form.category,
        name: form.name,
        steps: form.steps.map((s) => ({
          stepNumber: s.stepNumber,
          title: s.title,
          ...(s.description ? { description: s.description } : {}),
        })),
      };
      if (editingId) {
        await updateTestGuide(editingId, payload);
      } else {
        await createTestGuide(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchGuides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Group guides by category
  const grouped = guides.reduce<Record<string, TestGuide[]>>((acc, g) => {
    (acc[g.category] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Test Guides</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Guide
        </button>
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Inline Form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Guide' : 'Add Guide'}
          </h2>
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Guide Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2 text-sm font-medium text-gray-700">Steps</div>
          <div className="space-y-2">
            {form.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-md border border-gray-100 bg-gray-50 p-2">
                <span className="mt-2 text-xs font-medium text-gray-400">#{step.stepNumber}</span>
                <input
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => updateStep(idx, 'title', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  placeholder="Description (optional)"
                  value={step.description}
                  onChange={(e) => updateStep(idx, 'description', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {form.steps.length > 1 && (
                  <button
                    onClick={() => removeStep(idx)}
                    className="mt-1 text-sm text-red-500 hover:text-red-700"
                    aria-label={`Remove step ${step.stepNumber}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addStep}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Step
          </button>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || form.steps.some((s) => !s.title)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Guide List grouped by category */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-500">No test guides found.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catGuides]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">{category}</h3>
              <div className="space-y-2">
                {catGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{guide.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {guide.steps.length} step{guide.steps.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => openEdit(guide)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
