'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionFromStorage, hasPermission } from '@/lib/admin-auth';
import { getAllAdmins, addAdmin, deleteAdmin, updateAdmin, type AdminUser } from '@/lib/admin-database';
import { ADMIN_ROLES, type AdminRole } from '@/lib/admin-roles';
import { Trash2, Edit2, Plus, Check, X } from 'lucide-react';

export default function AdminManagementPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    phone: '',
    role: 'finance_admin' as AdminRole,
  });

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    setSession(adminSession);

    if (adminSession?.role !== 'superadmin') {
      router.push('/admin/dashboard');
      return;
    }

    loadAdmins();
  }, [router]);

  const loadAdmins = () => {
    setAdmins(getAllAdmins());
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill all required fields');
      return;
    }

    const newAdmin: AdminUser = {
      id: `admin_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    if (addAdmin(newAdmin)) {
      loadAdmins();
      setFormData({
        username: '',
        email: '',
        password: '',
        displayName: '',
        phone: '',
        role: 'finance_admin',
      });
      setShowForm(false);
      alert('✅ Admin created successfully!');
    } else {
      alert('❌ Admin with this email or username already exists');
    }
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      if (deleteAdmin(id)) {
        loadAdmins();
        alert('✅ Admin deleted successfully!');
      }
    }
  };

  if (!session || session.role !== 'superadmin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">🔒 Access Denied. Super Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-white">Admin Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:shadow-lg transition"
        >
          <Plus className="h-5 w-5" />
          Create New Admin
        </button>
      </div>

      {/* Add Admin Form */}
      {showForm && (
        <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">➕ Create New Admin</h2>
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-yellow-500 font-semibold mb-2">Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g., finance_user"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@indcric.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-semibold mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Secure password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-semibold mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Full name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20"
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-semibold mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91-9876543210"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20"
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-semibold mb-2">Admin Type *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20"
                required
              >
                <option value="finance_admin">💰 Finance Admin</option>
                <option value="quiz_admin">❓ Quiz Admin</option>
                <option value="ads_admin">📢 Ads Admin</option>
                <option value="content_admin">📝 Content Admin</option>
                <option value="support_admin">🆘 Support Admin</option>
              </select>
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Create Admin
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-yellow-600 border-opacity-20">
                <th className="text-left px-6 py-4 font-black text-yellow-500">NAME</th>
                <th className="text-left px-6 py-4 font-black text-yellow-500">EMAIL</th>
                <th className="text-left px-6 py-4 font-black text-yellow-500">USERNAME</th>
                <th className="text-left px-6 py-4 font-black text-yellow-500">ROLE</th>
                <th className="text-left px-6 py-4 font-black text-yellow-500">PHONE</th>
                <th className="text-left px-6 py-4 font-black text-yellow-500">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-4 text-white font-semibold">{admin.displayName}</td>
                  <td className="px-6 py-4 text-gray-300">{admin.email}</td>
                  <td className="px-6 py-4 text-gray-300 font-mono text-xs bg-gray-800 rounded px-2 py-1 w-fit">
                    {admin.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-yellow-600 text-black font-bold text-xs">
                      {admin.role.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{admin.phone || '-'}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
