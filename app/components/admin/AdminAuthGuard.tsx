'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

const ADMIN_SESSION_KEY = 'indcric_admin_session';

interface AdminSession {
  email: string;
  role: string;
  permissions: string[]; // Array of permissions
}

interface Props {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export default function AdminAuthGuard({ children, requiredPermissions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Allow login page without auth
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    const checkAuth = () => {
      try {
        const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);

        if (!sessionStr) {
          console.log('❌ No session found, redirecting to login');
          router.push('/admin/login');
          setIsAuthorized(false);
          return;
        }

        const session: AdminSession = JSON.parse(sessionStr);

        if (!session.email || !session.role) {
          console.log('❌ Invalid session structure');
          localStorage.removeItem(ADMIN_SESSION_KEY);
          router.push('/admin/login');
          setIsAuthorized(false);
          return;
        }

        // Ensure permissions is always an array
        let permissionsArray: string[] = [];
        
        if (Array.isArray(session.permissions)) {
          permissionsArray = session.permissions;
        } else if (typeof session.permissions === 'string') {
          // Convert string permission to array (e.g., "*" → ["*"])
          permissionsArray = [session.permissions];
        }

        console.log('📋 Session permissions:', permissionsArray);

        // Check permissions
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(perm =>
            permissionsArray.includes(perm) || permissionsArray.includes('*')
          );

          if (!hasPermission) {
            console.log('❌ Insufficient permissions. Required:', requiredPermissions, 'Got:', permissionsArray);
            setIsAuthorized(false);
            return;
          }
        }

        console.log('✅ Auth check passed for:', session.email);
        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        router.push('/admin/login');
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">🔐 Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <p className="text-xl">🚫 Access Denied</p>
          <p className="text-sm text-green-200 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
