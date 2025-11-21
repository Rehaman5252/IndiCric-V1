import { AdminRole, AdminSession } from './admin-roles';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  phone: string;
  role: AdminRole;
  createdAt: string;
  isActive: boolean;
}

// Initial admin database (in production, use Firestore)
export const ADMIN_DATABASE: AdminUser[] = [
  {
    id: 'super_001',
    username: 'superadmin',
    email: 'rehamansyed07@gmail.com',
    password: 'Indcric@100',
    displayName: 'Rehaman Syed',
    phone: '+91-9876543210',
    role: 'superadmin',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  // Sample sub-admins (can be deleted/edited by super admin)
  {
    id: 'finance_001',
    username: 'finance_user',
    email: 'finance@indcric.com',
    password: 'Finance@123',
    displayName: 'Finance Manager',
    phone: '+91-9111111111',
    role: 'finance_admin',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'quiz_001',
    username: 'quiz_user',
    email: 'quiz@indcric.com',
    password: 'Quiz@123',
    displayName: 'Quiz Master',
    phone: '+91-9222222222',
    role: 'quiz_admin',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

// Helper functions
export function findAdminByEmail(email: string): AdminUser | undefined {
  return ADMIN_DATABASE.find(admin => admin.email === email);
}

export function findAdminByUsername(username: string): AdminUser | undefined {
  return ADMIN_DATABASE.find(admin => admin.username === username);
}

export function addAdmin(admin: AdminUser): boolean {
  const exists = ADMIN_DATABASE.find(a => a.email === admin.email || a.username === admin.username);
  if (exists) return false;
  ADMIN_DATABASE.push(admin);
  return true;
}

export function updateAdmin(id: string, updates: Partial<AdminUser>): boolean {
  const admin = ADMIN_DATABASE.find(a => a.id === id);
  if (!admin) return false;
  Object.assign(admin, updates);
  return true;
}

export function deleteAdmin(id: string): boolean {
  const index = ADMIN_DATABASE.findIndex(a => a.id === id);
  if (index === -1) return false;
  ADMIN_DATABASE.splice(index, 1);
  return true;
}

export function getAllAdmins(): AdminUser[] {
  return ADMIN_DATABASE;
}
