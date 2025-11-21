'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AuditLogs from '@/app/components/admin/AuditLogs';

export default function AuditLogsPage() {
  return (
    <AdminAuthGuard requiredPermissions={['logs:view']}>
      <AdminLayout>
        <AuditLogs />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
