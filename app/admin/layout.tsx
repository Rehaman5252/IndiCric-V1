'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { getSessionFromStorage, clearSessionStorage, hasModule } from '@/lib/admin-auth';
import { AdminSession } from '@/lib/admin-roles';

const MENU_ITEMS = {
  dashboard: { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  finances: { label: 'Finances', icon: '💰', path: '/admin/finances' },
  quizzes: { label: 'Quizzes', icon: '❓', path: '/admin/quizzes' },
  ads: { label: 'Ads Management', icon: '📢', path: '/admin/ads' },
  submissions: { label: 'Submissions', icon: '📋', path: '/admin/submissions' },
  users: { label: 'Users', icon: '👥', path: '/admin/users' },
  admins: { label: 'Admin Management', icon: '🔑', path: '/admin/admins' },
  support: { label: 'Support', icon: '🆘', path: '/admin/support' },
  settings: { label: 'Settings', icon: '⚙️', path: '/admin/settings' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login' || pathname === '/admin') {
      setLoading(false);
      return;
    }

    // Check session
    const adminSession = getSessionFromStorage();

    if (!adminSession) {
      console.log('No session found, redirecting to login');
      router.push('/admin/login');
      return;
    }

    console.log('Session found:', adminSession.displayName, adminSession.role);
    setSession(adminSession);
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    clearSessionStorage();
    router.push('/admin/login');
  };

  // Don't show layout on login/root page
  if (pathname === '/admin/login' || pathname === '/admin') {
    return <>{children}</>;
  }

  // Show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // No session
  if (!session) {
    return null;
  }

  // Filter menu by permissions
  const visibleMenuItems = Object.entries(MENU_ITEMS)
    .filter(([key]) => {
      // Super admin sees everything
      if (session.role === 'superadmin') return true;
      // Sub-admins only see their modules
      return session.modules.includes(key);
    })
    .map(([_, item]) => item);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-black border-r border-yellow-600 border-opacity-20 transition-all duration-300 flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-yellow-600 border-opacity-20 flex items-center justify-between">
          <div className={sidebarOpen ? 'block' : 'hidden'}>
            <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              IndCric
            </h2>
            <p className="text-xs text-yellow-500 font-semibold uppercase tracking-widest mt-1">
              {session.role.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-yellow-500 hover:text-yellow-400 transition"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-500'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-yellow-600 border-opacity-20 p-4">
          <div className={`flex items-center gap-3 ${sidebarOpen ? 'mb-4' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {session.displayName.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{session.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{session.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-950 hover:text-red-300 transition font-semibold"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-yellow-600 border-opacity-20 px-8 py-6 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wide">Welcome,</p>
            <h1 className="text-3xl font-black text-white">{session.displayName}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
              <p className="text-lg font-bold text-yellow-500">{session.role.replace(/_/g, ' ').toUpperCase()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              {session.displayName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
