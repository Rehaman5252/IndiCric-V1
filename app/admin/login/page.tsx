'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authenticateAdmin, saveSessionToStorage } from '@/lib/admin-auth';
import { LogIn, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const session = authenticateAdmin(input, password);

      if (session) {
        saveSessionToStorage(session);
        console.log('✅ Login successful:', session.displayName);
        router.push('/admin/dashboard');
      } else {
        setError('❌ Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-yellow-600 border-opacity-30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-full mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-4xl font-black text-white mb-1">IndCric</h1>
            <p className="text-yellow-500 font-semibold text-sm tracking-wider">ADMIN CONTROL PANEL</p>
            <p className="text-gray-400 text-xs mt-2">Role-Based Access System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-950 border border-red-700 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Email/Username Input */}
            <div>
              <label className="block text-sm font-semibold text-yellow-500 mb-3 uppercase tracking-wide">
                Email or Username
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your email or username"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20 transition"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-yellow-500 mb-3 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20 transition"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-8 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <LogIn className="h-5 w-5" />
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-yellow-500 font-bold text-sm mb-3">📋 Demo Credentials:</p>
            <div className="space-y-2 text-gray-300 text-xs">
              <p><span className="text-yellow-400 font-semibold">Super Admin:</span> rehamansyed07@gmail.com / Indcric@100</p>
              <p><span className="text-yellow-400 font-semibold">Finance:</span> finance@indcric.com / Finance@123</p>
              <p><span className="text-yellow-400 font-semibold">Quiz:</span> quiz@indcric.com / Quiz@123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">🔒 Secure Admin Portal | All access logged</p>
      </div>
    </div>
  );
}
