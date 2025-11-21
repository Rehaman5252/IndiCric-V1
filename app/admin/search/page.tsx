'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Please enter a search term');
      return;
    }

    // Mock search results
    const mockResults = [
      {
        type: 'User',
        title: 'user@example.com',
        description: 'Email matches search',
        icon: '👤',
      },
      {
        type: 'Quiz',
        title: 'IPL 2024 Trivia',
        description: 'Quiz title contains search term',
        icon: '❓',
      },
      {
        type: 'Admin',
        title: 'rehamansyed07@gmail.com',
        description: 'Admin account',
        icon: '🔐',
      },
    ];

    setResults(mockResults);
  };

  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Global Search</h2>

          {/* Search Box */}
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search users, admins, quizzes, payouts..."
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 text-lg"
                  />
                </div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                >
                  <option value="all">All Types</option>
                  <option value="users">Users</option>
                  <option value="admins">Admins</option>
                  <option value="quizzes">Quizzes</option>
                  <option value="payouts">Payouts</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  Search
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Search Results ({results.length})</h3>
              {results.map((result, idx) => (
                <Card key={idx} className="shadow-lg border-0 hover:shadow-xl transition cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{result.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{result.title}</h4>
                        <p className="text-sm text-gray-600">{result.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Type: {result.type}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition font-semibold">
                        View
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchTerm && results.length === 0 && (
            <Card className="shadow-lg border-0 text-center">
              <CardContent className="pt-6">
                <p className="text-gray-600 text-lg">No results found for "{searchTerm}"</p>
              </CardContent>
            </Card>
          )}

          {!searchTerm && (
            <Card className="shadow-lg border-0 bg-gray-50">
              <CardContent className="pt-6 text-center">
                <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Enter a search term to find users, admins, quizzes, or payouts</p>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
