'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import ActivityMonitor from '@/app/components/admin/activity/ActivityMonitor';

export default function ActivityMonitorPage() {
  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <ActivityMonitor />
      </AdminLayout>
    </AdminAuthGuard>
  );
}