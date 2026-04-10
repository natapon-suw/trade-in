'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deactivatePricingRule,
  type PricingRule,
} from '../../../lib/api';

const CATEGORIES = ['', 'LAPTOP', 'PC', 'MACBOOK'] as const;
const CONDITION_TYPES = ['DEFECT_SEVERITY', 'TEST_PASS_RATE', 'DEFECT_COUNT'] as const;
const CONDITION_OPERATORS = ['GT', 'GTE', 'LT', 'LTE', 'EQ'] as const;
const ADJUSTMENT_TYPES = ['PERCENTAGE', 'FIXED'] as const;

const OPERATOR_LABELS: Record<string, string> = {
  GT: '>',
  GTE: '≥',
  LT: '<',
  LTE: '≤',
  EQ: '=',
};

interface RuleForm {
  name: string;
  category: string;
  conditionType: string;
  conditionOperator: string;
  conditionValue: string;
  adjustmentType: string;
  adjustmentValue: string;
  priority: string;
}

const emptyForm: RuleForm = {
  name: '',
  category: '',
  conditionType: 'DEFECT_SEVERITY',
  conditionOperator: 'GT',
  conditionValue: '',
  adjustmentType: 'PERCENTAGE',
  adjustmentValue: '',
  priority: '0',
};

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPricingRules();
      setRules(res.data);
    } catch {
      setError('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      category: rule.category ?? '',
      conditionType: rule.conditionType,
      conditionOperator: rule.conditionOperator,
      conditionValue: String(rule.conditionValue),
      adjustmentType: rule.adjustmentType,
      adjustmentValue: String(rule.adjustmentValue),
      priority: String(rule.priority),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        ...(form.category ? { category: form.category } : {}),
        conditionType: form.conditionType,
        conditionOperator: form.conditionOperator,
        conditionValue: Number(form.conditionValue),
        adjustmentType: form.adjustmentType,
        adjustmentValue: Number(form.adjustmentValue),
        priority: Number(form.priority),
      };
      if (editingId) {
        await updatePricingRule(editingId, payload);
      } else {
        await createPricingRule(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivatePricingRule(id);
      setConfirmDeactivateId(null);
      await fetchRules();
    } catch {
      setError('Failed to deactivate rule');
    }
  };

  const isFormValid =
    form.name.trim() !== '' &&
    form.conditionValue.trim() !== '' &&
    form.adjustmentValue.trim() !== '' &&
    form.priority.trim() !== '';

  const formatAdjustment = (type: string, value: number) => {
    if (type === 'PERCENTAGE') return `${value}%`;
    return `$${value}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Rules</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Rule
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Inline Form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Rule' : 'Add Rule'}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
              <input
                placeholder="Rule name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Category (optional)</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.filter(Boolean).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Priority</label>
              <input
                type="number"
                placeholder="0"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Condition Type</label>
              <select
                value={form.conditionType}
                onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CONDITION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Operator</label>
              <select
                value={form.conditionOperator}
                onChange={(e) => setForm({ ...form, conditionOperator: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CONDITION_OPERATORS.map((op) => (
                  <option key={op} value={op}>{OPERATOR_LABELS[op]} ({op})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Condition Value</label>
              <input
                type="number"
                placeholder="Threshold"
                value={form.conditionValue}
                onChange={(e) => setForm({ ...form, conditionValue: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Adjustment Type</label>
              <select
                value={form.adjustmentType}
                onChange={(e) => setForm({ ...form, adjustmentType: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ADJUSTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Adjustment Value</label>
              <input
                type="number"
                placeholder="e.g. -10"
                value={form.adjustmentValue}
                onChange={(e) => setForm({ ...form, adjustmentValue: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !isFormValid}
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

      {/* Deactivation Confirmation */}
      {confirmDeactivateId && (
        <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            Are you sure you want to deactivate this rule?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleDeactivate(confirmDeactivateId)}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Deactivate
            </button>
            <button
              onClick={() => setConfirmDeactivateId(null)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-gray-500">No pricing rules found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Adjustment</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{rule.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {rule.category ?? 'All'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    <span className="text-gray-500">{rule.conditionType.replace(/_/g, ' ')}</span>{' '}
                    {OPERATOR_LABELS[rule.conditionOperator] ?? rule.conditionOperator}{' '}
                    {rule.conditionValue}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    <span className={rule.adjustmentValue < 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatAdjustment(rule.adjustmentType, rule.adjustmentValue)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{rule.priority}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(rule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeactivateId(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
