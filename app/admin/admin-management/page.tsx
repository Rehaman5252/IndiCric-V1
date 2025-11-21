'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AdminManagement from '@/app/components/admin/admin-mgmt/AdminManagement';

export default function AdminManagementPage() {
  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <AdminManagement />
      </AdminLayout>
    </AdminAuthGuard>
  );
}