'use client';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useUser } from '@/contexts/UserContext';

export default function TestProtectedPage() {
  const { isAuthenticated } = useUser();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">受保护页面测试</h1>
            <p className="text-gray-600">
              如果你能看到这个页面，说明你已经登录了！
            </p>
            <p className="text-gray-600 mt-2">
              认证状态: {isAuthenticated ? '已登录' : '未登录'}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 