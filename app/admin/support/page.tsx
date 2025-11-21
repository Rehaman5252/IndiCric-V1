'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';
import { Mail, Phone, PhoneOff, User } from 'lucide-react';

export default function SupportPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
  }, [router]);

  if (!session) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">🆘 Support Center</h1>
      
      {/* Support Contact Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 shadow-lg max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-blue-600">R</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Rehman</h2>
            <p className="text-blue-100 text-sm">Support Manager</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold opacity-80">Email</p>
                <a 
                  href="mailto:rehamansyed07@gmail.com"
                  className="text-white text-lg font-bold hover:underline break-all"
                >
                  rehamansyed07@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Primary Phone */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
            <div className="flex items-start gap-3">
              <Phone className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold opacity-80">Primary Phone</p>
                <a 
                  href="tel:+917842722245"
                  className="text-white text-lg font-bold hover:underline"
                >
                  +91 78427 22245
                </a>
              </div>
            </div>
          </div>

          {/* Alternate Phone */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
            <div className="flex items-start gap-3">
              <PhoneOff className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold opacity-80">Alternate Phone</p>
                <a 
                  href="tel:+918050298115"
                  className="text-white text-lg font-bold hover:underline"
                >
                  +91 80502 98115
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="mailto:rehamansyed07@gmail.com"
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center font-bold"
        >
          📧 Send Email
        </a>
        <a 
          href="tel:+917842722245"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center font-bold"
        >
          📞 Call Primary
        </a>
        <a 
          href="tel:+918050298115"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center font-bold"
        >
          ☎️ Call Alternate
        </a>
      </div>

      {/* Info Box */}
      <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-3">ℹ️ Support Hours</h3>
        <p className="text-gray-300">
          Available 24/7 for urgent support. Please contact Rehman via phone or email for assistance.
        </p>
      </div>
    </div>
  );
}
