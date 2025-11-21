'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import QuizManager from '@/app/components/admin/QuizManager';

export default function QuizPage() {
  return (
    <AdminAuthGuard requiredPermissions={['quiz:view', 'quiz:create']}>
      <AdminLayout>
        <QuizManager />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
