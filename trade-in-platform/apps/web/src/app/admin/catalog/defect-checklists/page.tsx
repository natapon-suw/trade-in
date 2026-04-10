'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getDefectChecklists,
  createDefectChecklist,
  updateDefectChecklist,
  type DefectChecklist,
} from '../../../../lib/api';

const CATEGORIES = ['LAPTOP', 'PC', 'MACBOOK'] as const;

interface ItemForm {
  name: string;
  description: string;
  defaultSeverity: number;
}

interface ChecklistForm {
  category: string;
  name: string;
  items: ItemForm[];
}

const emptyItem: ItemForm = { name: '', description: '', defaultSeverity: 3 };
const emptyForm: ChecklistForm = { category: 'LAPTOP', name: '', items: [{ ...emptyItem }] };

export default function DefectChecklistsPage() {
  const [checklists, setChecklists] = useState<DefectChecklist[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChecklistForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDefectChecklists(categoryFilter || undefined);
      setChecklists(res.data);
    } catch {
      setError('Failed to load defect checklists');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (checklist: DefectChecklist) => {
    setEditingId(checklist.id);
    setForm({
      category: checklist.category,
      name: checklist.name,
      items: checklist.items.map((item) => ({
        name: item.name,
        description: item.description ?? '',
        defaultSeverity: item.defaultSeverity ?? 3,
      })),
    });
    setShowForm(true);
  };

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  };

  const removeItem = (idx: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx: number, field: keyof ItemForm, value: string | number) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        category: form.category,
        name: form.name,
        items: form.items.map((item) => ({
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          defaultSeverity: item.defaultSeverity,
        })),
      };
      if (editingId) {
        await updateDefectChecklist(editingId, payload);
      } else {
        await createDefectChecklist(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchChecklists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Group by category
  const grouped = checklists.reduce<Record<string, DefectChecklist[]>>((acc, cl) => {
    (acc[cl.category] ??= []).push(cl);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Defect Checklists</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Checklist
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
            {editingId ? 'Edit Checklist' : 'Add Checklist'}
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
              placeholder="Checklist Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2 text-sm font-medium text-gray-700">Defect Items</div>
          <div className="space-y-2">
            {form.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-md border border-gray-100 bg-gray-50 p-2">
                <input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  placeholder="Description (optional)"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={item.defaultSeverity}
                  onChange={(e) => updateItem(idx, 'defaultSeverity', Number(e.target.value))}
                  className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label={`Severity for ${item.name || 'item'}`}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>Sev {s}</option>
                  ))}
                </select>
                {form.items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className="mt-1 text-sm text-red-500 hover:text-red-700"
                    aria-label={`Remove item ${item.name || idx + 1}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addItem}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Item
          </button>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || form.items.some((i) => !i.name)}
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

      {/* Checklist List grouped by category */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-500">No defect checklists found.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catChecklists]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">{category}</h3>
              <div className="space-y-2">
                {catChecklists.map((cl) => (
                  <div
                    key={cl.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{cl.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {cl.items.length} item{cl.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => openEdit(cl)}
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
