'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  HelpCircle,
  Megaphone,
  MessageSquare,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  FileText,
  UserCog,
} from 'lucide-react';
import { AdminSession } from '@/lib/admin-credentials';

const ADMIN_SESSION_KEY = 'indcric_admin_session';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  requiredPermissions?: string[];
  children?: { label: string; href: string; requiredPermissions?: string[] }[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Quiz Management']);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionStr) {
      try {
        setAdminSession(JSON.parse(sessionStr));
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
  }, []);

  const hasPermission = (requiredPermissions?: string[]): boolean => {
    if (!adminSession) return false;
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return (
      adminSession.permissions.includes('*') ||
      requiredPermissions.some(perm => adminSession.permissions.includes(perm))
    );
  };

  const navItems: NavItem[] = [
    {
      label: 'Dashboard Home',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/admin/dashboard',
    },
    {
      label: 'Cube & Brand Logos',
      icon: <Box className="h-5 w-5" />,
      href: '/admin/cube-logos',
      requiredPermissions: ['settings:edit', 'settings:view'],
    },
    {
      label: 'Quiz Management',
      icon: <HelpCircle className="h-5 w-5" />,
      href: '/admin/quiz',
      requiredPermissions: ['quiz:view', 'quiz:create'],
    },
    {
      label: 'Ads Management',
      icon: <Megaphone className="h-5 w-5" />,
      href: '/admin/ads',
      requiredPermissions: ['ads:view', 'ads:upload'],
      badge: 5,
    },
    {
      label: 'Submissions & Commentary',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/admin/submissions',
      requiredPermissions: ['submissions:view', 'submissions:approve'],
      badge: 5,
    },
    {
      label: 'Users Management',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      requiredPermissions: ['users:view', 'users:manage'],
    },
    {
      label: 'Payouts',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/payouts',
      requiredPermissions: ['payouts:view', 'payouts:process'],
      badge: 3,
    },
    {
      label: 'Audit Logs',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/audit-logs',
      requiredPermissions: ['logs:view'],
    },
    {
      label: 'Admin Management',
      icon: <UserCog className="h-5 w-5" />,
      href: '/admin/settings',
      requiredPermissions: ['*'],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    router.push('/admin/login');
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const filteredNavItems = navItems.filter(item => hasPermission(item.requiredPermissions));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-green-800 to-green-900 text-white transition-all duration-300 flex flex-col shadow-lg overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-green-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8" />
              <div>
                <span className="font-bold text-lg">IndCric</span>
                <p className="text-xs text-green-200">Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-green-700 rounded-lg transition"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Admin Info */}
        {sidebarOpen && adminSession && (
          <div className="p-4 border-b border-green-700 bg-green-700/30">
            <p className="text-xs text-green-200">Logged in as:</p>
            <p className="font-semibold text-sm truncate">{adminSession.displayName}</p>
            <p className="text-xs text-green-300 capitalize">{adminSession.role.replace(/_/g, ' ')}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === item.href
                  ? 'bg-green-700 text-white'
                  : 'hover:bg-green-700/50'
              } ${!sidebarOpen && 'justify-center'}`}
              title={!sidebarOpen ? item.label : ''}
            >
              {item.icon}
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-green-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-6 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {pathname.split('/').pop()?.replace('-', ' ').toUpperCase() || 'DASHBOARD'}
            </h1>
            {adminSession && (
              <p className="text-sm text-gray-600">Role: {adminSession.role.replace(/_/g, ' ')}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{adminSession?.displayName}</p>
              <p className="text-xs text-gray-600">{adminSession?.email}</p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
              {adminSession?.displayName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
