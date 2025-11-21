'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard or login
    const session = localStorage.getItem('admin_session');
    if (session) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return null;
}
