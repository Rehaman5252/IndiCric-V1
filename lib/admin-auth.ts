import { AdminRole, ADMIN_ROLES, AdminSession } from './admin-roles';
import { findAdminByEmail, findAdminByUsername, type AdminUser } from './admin-database';

const ADMIN_SESSION_KEY = 'indcric_admin_session'; // ✅ Define once at top

export function authenticateAdmin(emailOrUsername: string, password: string): AdminSession | null {
  let admin: AdminUser | undefined = findAdminByEmail(emailOrUsername);
  if (!admin) {
    admin = findAdminByUsername(emailOrUsername);
  }

  if (!admin || admin.password !== password || !admin.isActive) {
    return null;
  }

  const roleConfig = ADMIN_ROLES[admin.role];
  
  let permissionsArray: string[] = [];
  if (Array.isArray(roleConfig.permissions)) {
    permissionsArray = roleConfig.permissions;
  } else if (typeof roleConfig.permissions === 'string') {
    permissionsArray = [roleConfig.permissions];
  }

  const session: AdminSession = {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    displayName: admin.displayName,
    phone: admin.phone,
    role: admin.role,
    permissions: permissionsArray,
    modules: roleConfig.modules,
    loginTime: new Date().toISOString(),
    sessionId: Math.random().toString(36).substr(2, 9),
  };

  return session;
}

export function hasPermission(session: AdminSession | null, permission: string): boolean {
  if (!session) return false;
  if (session.permissions.includes('*')) return true;
  return session.permissions.includes(permission);
}

export function hasModule(session: AdminSession | null, module: string): boolean {
  if (!session) return false;
  if (session.permissions.includes('*')) return true;
  return session.modules.includes(module);
}

export function getSessionFromStorage(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  const sessionData = localStorage.getItem(ADMIN_SESSION_KEY); // ✅ Use const key
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export function saveSessionToStorage(session: AdminSession): void {
  if (typeof window !== 'undefined') {
    let permissionsArray: string[] = [];
    if (Array.isArray(session.permissions)) {
      permissionsArray = session.permissions;
    } else if (typeof session.permissions === 'string') {
      permissionsArray = [session.permissions];
    }

    const sessionToStore = {
      ...session,
      permissions: permissionsArray,
    };

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionToStore)); // ✅ Use const key
  }
}

export function clearSessionStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY); // ✅ Use const key
  }
}
