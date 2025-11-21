'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';


export default function AuditLogsPage() {
  return (
    <AdminAuthGuard requiredPermissions={['logs:view']}>
      <AdminLayout>
        <AuditLogs />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
