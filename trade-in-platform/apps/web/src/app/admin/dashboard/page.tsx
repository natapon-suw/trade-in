'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardMetrics,
  downloadExcel,
  getHierarchy,
  type DashboardMetrics,
  type HierarchyCountry,
} from '../../../lib/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [branchId, setBranchId] = useState('');
  const [hierarchy, setHierarchy] = useState<HierarchyCountry[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    getHierarchy().then(setHierarchy).catch(() => {});
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDashboardMetrics(
        dateFrom || undefined,
        dateTo || undefined,
        branchId || undefined,
      );
      setMetrics(data);
    } catch {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, branchId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleExport = async (type: 'stock' | 'assessments') => {
    setExporting(type);
    try {
      if (type === 'stock') {
        await downloadExcel('/v1/admin/export/stock', 'stock-export.xlsx');
      } else {
        const params = new URLSearchParams();
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        const qs = params.toString();
        await downloadExcel(
          `/v1/admin/export/assessments${qs ? `?${qs}` : ''}`,
          'assessments-export.xlsx',
        );
      }
    } catch {
      setError(`Failed to export ${type}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('stock')}
            disabled={exporting !== null}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting === 'stock' ? 'Exporting…' : 'Export Stock'}
          </button>
          <button
            onClick={() => handleExport('assessments')}
            disabled={exporting !== null}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting === 'assessments' ? 'Exporting…' : 'Export Assessments'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Date Range Filter */}
      <div className="mb-6 flex gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {(dateFrom || dateTo) && (
          <div className="flex items-end">
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Branch</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Branches</option>
            {hierarchy.map((country) =>
              country.provinces.map((province) =>
                province.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} — {province.name}, {country.name}
                  </option>
                )),
              ),
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : metrics ? (
        <>
          {/* Metrics Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Assessed Today</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.assessedToday}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Stock</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.totalStock}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Stock Value</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                ${metrics.stockValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
            {metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        activity.status === 'STOCKED'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'PRICED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.status}
                      </span>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
