'use client';

import { useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { AdminSidebar } from '../../components/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['admin-operation', 'admin-manager']}>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-20 flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-gray-500 hover:text-gray-700"
              aria-label="Open sidebar"
            >
              <span className="text-xl">☰</span>
            </button>
            <span className="ml-3 text-sm font-semibold text-gray-900">
              Trade-In Admin
            </span>
          </div>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
