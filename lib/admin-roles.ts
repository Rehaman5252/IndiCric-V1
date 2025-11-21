export type AdminRole = 'superadmin' | 'finance_admin' | 'quiz_admin' | 'ads_admin' | 'content_admin' | 'support_admin';

export const ADMIN_ROLES = {
  superadmin: {
    name: 'Super Admin',
    description: 'Full system access',
    permissions: ['*'],
    modules: ['dashboard', 'users', 'admins', 'analytics', 'finances', 'quizzes', 'ads', 'content', 'support', 'settings'],
  },
  finance_admin: {
    name: 'Finance Admin',
    description: 'Manage payouts and transactions',
    permissions: ['finances:view', 'finances:edit', 'payouts:manage'],
    modules: ['dashboard', 'finances', 'analytics'],
  },
  quiz_admin: {
    name: 'Quiz Admin',
    description: 'Create and manage quizzes',
    permissions: ['quizzes:create', 'quizzes:edit', 'quizzes:delete', 'quizzes:manage'],
    modules: ['dashboard', 'quizzes', 'analytics'],
  },
  ads_admin: {
    name: 'Ads Admin',
    description: 'Manage advertisements',
    permissions: ['ads:create', 'ads:edit', 'ads:delete', 'ads:manage'],
    modules: ['dashboard', 'ads', 'analytics'],
  },
  content_admin: {
    name: 'Content Admin',
    description: 'Moderate user content',
    permissions: ['content:view', 'content:approve', 'content:reject', 'content:delete'],
    modules: ['dashboard', 'content', 'submissions', 'analytics'],
  },
  support_admin: {
    name: 'Support Admin',
    description: 'Manage users and support',
    permissions: ['users:view', 'users:manage', 'support:manage'],
    modules: ['dashboard', 'users', 'support', 'analytics'],
  },
};

export interface AdminSession {
  id: string;
  email: string;
  username: string;
  displayName: string;
  phone?: string;
  role: AdminRole;
  permissions: string[];
  modules: string[];
  loginTime: string;
  sessionId: string;
}
