'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

interface NavItem {
  label: string;
  icon: string;
  href?: string;
  roles: string[];
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Assessment',
    icon: '📋',
    href: '/admin/assessment',
    roles: ['admin-operation', 'admin-manager'],
  },
  {
    label: 'Dashboard',
    icon: '📊',
    href: '/admin/dashboard',
    roles: ['admin-manager'],
  },
  {
    label: 'Stock',
    icon: '📦',
    href: '/admin/stock',
    roles: ['admin-manager'],
  },
  {
    label: 'Catalog',
    icon: '📁',
    roles: ['admin-manager'],
    children: [
      { label: 'Product Models', href: '/admin/catalog/models' },
      { label: 'Test Guides', href: '/admin/catalog/test-guides' },
      { label: 'Defect Checklists', href: '/admin/catalog/defect-checklists' },
    ],
  },
  {
    label: 'Pricing Rules',
    icon: '💰',
    href: '/admin/pricing',
    roles: ['admin-manager'],
  },
  {
    label: 'Branches',
    icon: '🏢',
    href: '/admin/branches',
    roles: ['admin-manager'],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin/assessment') {
    return pathname === href || pathname.startsWith(href + '/');
  }
  return pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon?: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}

function ExpandableNav({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const childActive = item.children?.some((c) => isActive(pathname, c.href)) ?? false;
  const [open, setOpen] = useState(childActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          childActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <span className="text-base">{item.icon}</span>
        <span className="flex-1 text-left">{item.label}</span>
        <span className="text-xs text-gray-400">{open ? '▼' : '▶'}</span>
      </button>
      {open && item.children && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children.map((child) => (
            <NavLink
              key={child.href}
              href={child.href}
              label={child.label}
              active={isActive(pathname, child.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <h1 className="text-lg font-semibold text-gray-900">Trade-In Admin</h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) =>
            item.children ? (
              <ExpandableNav key={item.label} item={item} pathname={pathname} />
            ) : (
              <NavLink
                key={item.href}
                href={item.href!}
                label={item.label}
                icon={item.icon}
                active={isActive(pathname, item.href!)}
              />
            ),
          )}
        </nav>

        {/* User info + logout */}
        {user && (
          <div className="border-t border-gray-200 p-4">
            <div className="mb-3">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">
                {user.role === 'admin-manager' ? 'Manager' : 'Operation'}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
