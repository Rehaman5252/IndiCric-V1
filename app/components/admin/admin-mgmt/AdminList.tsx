'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Admin {
  id: string;
  displayName: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  lastLogin?: Date;
}

interface AdminListProps {
  admins: Admin[];
  onEdit?: (admin: Admin) => void;
  onDelete?: (adminId: string) => void;
  onSuspend?: (adminId: string) => void;
}

export default function AdminList({ admins, onEdit, onDelete, onSuspend }: AdminListProps) {
  return (
    <Card className="shadow-lg border-0 overflow-x-auto">
      <CardHeader>
        <CardTitle>Admin Users</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 bg-gray-100">
              <th className="text-left p-3 font-bold">Name</th>
              <th className="text-left p-3 font-bold">Email</th>
              <th className="text-left p-3 font-bold">Role</th>
              <th className="text-left p-3 font-bold">Status</th>
              <th className="text-left p-3 font-bold">Last Login</th>
              <th className="text-left p-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{admin.displayName}</td>
                <td className="p-3">{admin.email}</td>
                <td className="p-3 capitalize text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                  {admin.role.replace(/_/g, ' ')}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      admin.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {admin.status}
                  </span>
                </td>
                <td className="p-3 text-gray-600 text-xs">
                  {admin.lastLogin
                    ? format(admin.lastLogin, 'MMM dd, HH:mm')
                    : 'Never'}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => onEdit?.(admin)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => onSuspend?.(admin.id)}
                    className={`px-3 py-1 rounded-lg transition text-xs font-semibold ${
                      admin.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {admin.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onDelete?.(admin.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
