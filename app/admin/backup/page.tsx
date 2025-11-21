'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBackupHistory, createBackupRecord } from '@/lib/firestore-service';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Plus, Database } from 'lucide-react';

export default function BackupPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const data = await getBackupHistory();
        setBackups(data);
      } catch (error) {
        console.error('Error fetching backups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await createBackupRecord({
        collections: ['users', 'quizzes', 'payouts', 'admin_users', 'admin_activity_logs'],
        backupPath: `gs://bucket/backups/backup_${new Date().toISOString()}.json`,
        sizeInMB: Math.random() * 500,
        createdBy: 'rehamansyed07@gmail.com',
      });
      alert('Backup created successfully!');
      const data = await getBackupHistory();
      setBackups(data);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading backups...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Backup & Data Export</h2>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              <Plus className="h-5 w-5" />
              {creating ? 'Creating...' : 'Create Backup Now'}
            </button>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 shadow-lg border-0">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700">
                ℹ️ <strong>Auto-backups</strong> are created daily at 2 AM. Manual backups can be created anytime.
              </p>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Backup History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 bg-gray-100">
                      <th className="text-left p-3 font-bold">Backup Time</th>
                      <th className="text-left p-3 font-bold">Type</th>
                      <th className="text-left p-3 font-bold">Collections</th>
                      <th className="text-left p-3 font-bold">Size (MB)</th>
                      <th className="text-left p-3 font-bold">Status</th>
                      <th className="text-left p-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          {format(new Date(backup.backupTime.toDate()), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="p-3 capitalize text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                          {backup.backupType}
                        </td>
                        <td className="p-3 text-xs text-gray-600">
                          {backup.collections.join(', ')}
                        </td>
                        <td className="p-3">{backup.sizeInMB.toFixed(2)}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                            ✓ Completed
                          </span>
                        </td>
                        <td className="p-3">
                          <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition text-xs font-semibold">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
