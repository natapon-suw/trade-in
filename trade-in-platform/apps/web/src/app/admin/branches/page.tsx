'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  getProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getUserAssignments,
  createUserAssignment,
  deleteUserAssignment,
  getAdminUsers,
  type Country,
  type Province,
  type Branch,
  type UserBranchAssignment,
  type AdminUser,
} from '../../../lib/api';

type Tab = 'countries' | 'provinces' | 'branches' | 'assignments';

export default function BranchManagementPage() {
  const [tab, setTab] = useState<Tab>('countries');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'countries', label: 'Countries' },
    { key: 'provinces', label: 'Provinces' },
    { key: 'branches', label: 'Branches' },
    { key: 'assignments', label: 'Assignments' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Branch Management</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'countries' && <CountriesTab />}
      {tab === 'provinces' && <ProvincesTab />}
      {tab === 'branches' && <BranchesTab />}
      {tab === 'assignments' && <AssignmentsTab />}
    </div>
  );
}

// ─── Countries Tab ─────────────────────────────

function CountriesTab() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCountries(await getCountries());
    } catch {
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateCountry(editingId, { name });
      } else {
        await createCountry({ name });
      }
      setShowForm(false);
      setEditingId(null);
      setName('');
      await fetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this country?')) return;
    setError('');
    try {
      await deleteCountry(id);
      await fetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const openEdit = (c: Country) => {
    setEditingId(c.id);
    setName(c.name);
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Countries</h2>
        <button
          onClick={() => { setEditingId(null); setName(''); setShowForm(true); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Country
        </button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            {editingId ? 'Edit Country' : 'Add Country'}
          </h3>
          <input
            placeholder="Country name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
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

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : countries.length === 0 ? (
        <p className="text-sm text-gray-500">No countries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {countries.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{c.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button onClick={() => openEdit(c)} className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">Delete</button>
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

// ─── Provinces Tab ─────────────────────────────

function ProvincesTab() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCountries = useCallback(async () => {
    try {
      setCountries(await getCountries());
    } catch { /* ignore */ }
  }, []);

  const fetchProvinces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProvinces(await getProvinces(selectedCountry || undefined));
    } catch {
      setError('Failed to load provinces');
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);
  useEffect(() => { fetchProvinces(); }, [fetchProvinces]);

  const handleSave = async () => {
    if (!selectedCountry && !editingId) {
      setError('Select a country first');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateProvince(editingId, { name });
      } else {
        await createProvince({ name, countryId: selectedCountry });
      }
      setShowForm(false);
      setEditingId(null);
      setName('');
      await fetchProvinces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this province?')) return;
    setError('');
    try {
      await deleteProvince(id);
      await fetchProvinces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const openEdit = (p: Province) => {
    setEditingId(p.id);
    setName(p.name);
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Provinces</h2>
        <button
          onClick={() => { setEditingId(null); setName(''); setShowForm(true); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Province
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            {editingId ? 'Edit Province' : 'Add Province'}
          </h3>
          {!editingId && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <input
            placeholder="Province name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim() || (!editingId && !selectedCountry)}
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

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : provinces.length === 0 ? (
        <p className="text-sm text-gray-500">No provinces yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {provinces.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{p.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.country?.name ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button onClick={() => openEdit(p)} className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Delete</button>
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

// ─── Branches Tab ──────────────────────────────

function BranchesTab() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCountries = useCallback(async () => {
    try { setCountries(await getCountries()); } catch { /* ignore */ }
  }, []);

  const fetchProvinces = useCallback(async () => {
    try { setProvinces(await getProvinces(selectedCountry || undefined)); } catch { /* ignore */ }
  }, [selectedCountry]);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBranches(await getBranches(selectedProvince || undefined, selectedCountry || undefined));
    } catch {
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, selectedProvince]);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);
  useEffect(() => { fetchProvinces(); }, [fetchProvinces]);
  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateBranch(editingId, { name: formName, address: formAddress });
      } else {
        await createBranch({ name: formName, address: formAddress, provinceId: formProvince });
      }
      setShowForm(false);
      setEditingId(null);
      setFormName('');
      setFormAddress('');
      setFormProvince('');
      await fetchBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    setError('');
    try {
      await deleteBranch(id);
      await fetchBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const openEdit = (b: Branch) => {
    setEditingId(b.id);
    setFormName(b.name);
    setFormAddress(b.address);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormAddress('');
    setFormProvince(selectedProvince);
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Branches</h2>
        <button
          onClick={openAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Branch
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <select
          value={selectedCountry}
          onChange={(e) => { setSelectedCountry(e.target.value); setSelectedProvince(''); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            {editingId ? 'Edit Branch' : 'Add Branch'}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {!editingId && (
              <select
                value={formProvince}
                onChange={(e) => setFormProvince(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:col-span-2"
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            <input
              placeholder="Branch name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Address"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim() || !formAddress.trim() || (!editingId && !formProvince)}
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

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : branches.length === 0 ? (
        <p className="text-sm text-gray-500">No branches yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Province</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{b.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{b.address}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{b.province?.name ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button onClick={() => openEdit(b)} className="mr-3 text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-800">Delete</button>
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

// ─── Assignments Tab ───────────────────────────

function AssignmentsTab() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [assignments, setAssignments] = useState<UserBranchAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCountries = useCallback(async () => {
    try { setCountries(await getCountries()); } catch { /* ignore */ }
  }, []);

  const fetchBranches = useCallback(async () => {
    try { setBranches(await getBranches()); } catch { /* ignore */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try { setUsers(await getAdminUsers()); } catch { /* ignore */ }
  }, []);

  const fetchAssignments = useCallback(async () => {
    if (!selectedBranch) { setAssignments([]); return; }
    setLoading(true);
    setError('');
    try {
      setAssignments(await getUserAssignments({ branchId: selectedBranch }));
    } catch {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => { fetchCountries(); fetchBranches(); fetchUsers(); }, [fetchCountries, fetchBranches, fetchUsers]);
  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleAssign = async () => {
    if (!selectedBranch || !selectedUserId) return;
    setSaving(true);
    setError('');
    try {
      await createUserAssignment({ userId: selectedUserId, branchId: selectedBranch });
      setSelectedUserId('');
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this assignment?')) return;
    setError('');
    try {
      await deleteUserAssignment(id);
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">User-Branch Assignments</h2>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Select Branch</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Choose a branch…</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.province?.name ?? ''}, {b.province?.country?.name ?? ''}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {selectedBranch && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-900">Assign User</h3>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — {u.role}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={saving || !selectedUserId}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : selectedBranch && assignments.length === 0 ? (
        <p className="text-sm text-gray-500">No users assigned to this branch.</p>
      ) : assignments.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.user?.name ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{a.user?.email ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{a.user?.role ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button onClick={() => handleRemove(a.id)} className="text-red-600 hover:text-red-800">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
