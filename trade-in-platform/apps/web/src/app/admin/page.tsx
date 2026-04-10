'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

export default function AdminIndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin-operation') {
      router.replace('/admin/assessment');
    } else {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting…</p>
    </div>
  );
}
