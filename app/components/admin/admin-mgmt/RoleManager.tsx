'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const roles = [
  {
    name: 'Super Admin',
    permissions: ['*'],
    description: 'Full access to all modules and settings',
    color: 'bg-red-50',
    icon: '👑',
  },
  {
    name: 'Quiz Manager',
    permissions: ['quiz:create', 'quiz:edit', 'quiz:delete', 'quiz:schedule', 'questions:manage'],
    description: 'Can create, edit, schedule, and manage quizzes',
    color: 'bg-blue-50',
    icon: '❓',
  },
  {
    name: 'Ads Manager',
    permissions: ['ads:upload', 'ads:edit', 'ads:delete', 'ads:schedule', 'ads:view'],
    description: 'Can upload, schedule, and manage advertisements',
    color: 'bg-orange-50',
    icon: '📢',
  },
  {
    name: 'Submissions Moderator',
    permissions: ['submissions:approve', 'submissions:reject', 'submissions:view', 'commentary:moderate'],
    description: 'Can review and approve/reject user submissions',
    color: 'bg-yellow-50',
    icon: '✅',
  },
  {
    name: 'Users & Payouts Manager',
    permissions: ['users:view', 'users:manage', 'payouts:process', 'payouts:view', 'payouts:history'],
    description: 'Can manage users and process payouts',
    color: 'bg-green-50',
    icon: '💰',
  },
  {
    name: 'Settings & Reports',
    permissions: ['settings:view', 'settings:edit', 'logs:view', 'reports:generate', 'analytics:view'],
    description: 'Can view settings, logs, and generate reports',
    color: 'bg-purple-50',
    icon: '⚙️',
  },
];

export default function RoleManager() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Role-Based Access Control (RBAC)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role, idx) => (
          <Card key={idx} className={`shadow-lg border-0 ${role.color}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{role.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{role.name}</h4>
                  <p className="text-sm text-gray-700 mt-1">{role.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.permissions.map((perm, pidx) => (
                      <span
                        key={pidx}
                        className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
