'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllAdmins, updateAdminUser, deleteAdminUser } from '@/lib/firestore-service';
import { Plus, Shield, Clock } from 'lucide-react';
import AdminList from './AdminList';
import AdminForm from './AdminForm';
import RoleManager from './RoleManager';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await getAllAdmins();
        setAdmins(data);
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (formData: any) => {
    // Implementation to create admin
    console.log('Create admin:', formData);
    setShowForm(false);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await deleteAdminUser(adminId);
      setAdmins(admins.filter(a => a.id !== adminId));
      alert('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin');
    }
  };

  const handleSuspendAdmin = async (adminId: string) => {
    try {
      const admin = admins.find(a => a.id === adminId);
      const newStatus = admin.status === 'active' ? 'suspended' : 'active';
      await updateAdminUser(adminId, { status: newStatus });
      setAdmins(admins.map(a => (a.id === adminId ? { ...a, status: newStatus } : a)));
      alert(`Admin ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Failed to update admin');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admins...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          <Plus className="h-5 w-5" />
          Add New Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 shadow-lg border-0">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{admins.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="bg-green-50 shadow-lg border-0">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {admins.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>

        <Card className="bg-red-50 shadow-lg border-0">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-3xl font-bold text-red-700 mt-2">
                {admins.filter(a => a.status === 'suspended').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <AdminForm
          onSubmit={handleCreateAdmin}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* RBAC Roles */}
      <RoleManager />

      {/* Admin List */}
      <AdminList
        admins={admins}
        onDelete={handleDeleteAdmin}
        onSuspend={handleSuspendAdmin}
      />
    </div>
  );
}
