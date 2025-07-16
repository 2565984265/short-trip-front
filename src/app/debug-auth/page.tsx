'use client';

import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

export default function DebugAuthPage() {
  const { user, token, isAuthenticated, login, logout } = useUser();

  useEffect(() => {
    console.log('DebugAuthPage mounted - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);

  const handleTestLogin = () => {
    const testUser = {
      id: 999,
      username: 'testuser',
      email: 'test@example.com',
      role: 'USER'
    };
    const testToken = 'test-token-123';
    login(testUser, testToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">认证状态调试</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">当前状态</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">isAuthenticated:</span> <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated.toString()}</span></p>
                <p><span className="font-medium">user:</span> {user ? JSON.stringify(user) : 'null'}</p>
                <p><span className="font-medium">token:</span> {token ? `${token.substring(0, 20)}...` : 'null'}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">操作</h2>
              <div className="space-y-2">
                <button
                  onClick={handleTestLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  测试登录
                </button>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors ml-2"
                >
                  退出登录
                </button>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">localStorage 状态</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">token:</span> {typeof window !== 'undefined' ? localStorage.getItem('token') || 'null' : 'SSR'}</p>
                <p><span className="font-medium">user:</span> {typeof window !== 'undefined' ? localStorage.getItem('user') || 'null' : 'SSR'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 