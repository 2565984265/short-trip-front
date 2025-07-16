'use client';

import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';

export default function TestLoginPage() {
  const { user, isAuthenticated, login, logout } = useUser();
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    const testUser = {
      id: 1,
      username: username || 'testuser',
      email: 'test@example.com',
      role: 'USER'
    };
    const testToken = 'test-token-' + Date.now();
    login(testUser, testToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">登录测试</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">当前状态</h2>
              <p className="text-sm">
                <span className="font-medium">认证状态:</span> 
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? '已登录' : '未登录'}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">用户名:</span> {user?.username || '无'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">测试登录</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  登录
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  退出
                </button>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-2">导航测试</h2>
              <div className="space-y-2">
                <a href="/" className="block text-blue-600 hover:text-blue-800 underline">
                  返回首页
                </a>
                <a href="/debug-auth" className="block text-blue-600 hover:text-blue-800 underline">
                  调试页面
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 