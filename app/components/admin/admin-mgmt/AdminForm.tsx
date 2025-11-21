'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';

interface AdminFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminForm({ onSubmit, onCancel, isLoading }: AdminFormProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'quiz_manager',
  });

  const roles = [
    { value: 'superadmin', label: 'Super Admin - Full Access' },
    { value: 'quiz_manager', label: 'Quiz Manager' },
    { value: 'ads_manager', label: 'Ads Manager' },
    { value: 'submissions_moderator', label: 'Submissions Moderator' },
    { value: 'users_payouts_manager', label: 'Users & Payouts Manager' },
    { value: 'settings_reports', label: 'Settings & Reports' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      alert('Please fill all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Create New Admin Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="John Doe"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@indcric.com"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-green-600"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-semibold"
            >
              <Save className="h-5 w-5" />
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
