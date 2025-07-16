'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function DebugPage() {
  const { user, isAuthenticated, loading, token } = useUser();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    // 获取localStorage中的所有数据
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setLocalStorageData({
      token: token ? `${token.substring(0, 20)}...` : null,
      user: user ? JSON.parse(user) : null,
      hasToken: !!token,
      hasUser: !!user
    });
  }, []);

  const testTokenValidation = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      alert('没有找到保存的token');
      return;
    }

    try {
      console.log('Testing token validation...');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      alert(`Token验证结果: ${response.ok ? '成功' : '失败'}\n状态码: ${response.status}\n响应: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Token validation error:', error);
      alert(`Token验证出错: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">调试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UserContext状态 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">UserContext状态</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {loading ? '是' : '否'}</p>
              <p><strong>已认证:</strong> {isAuthenticated ? '是' : '否'}</p>
              <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : '无'}</p>
              <p><strong>用户:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {user ? JSON.stringify(user, null, 2) : '无'}
              </pre>
            </div>
          </div>

          {/* localStorage状态 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">localStorage状态</h2>
            <div className="space-y-2 text-sm">
              <p><strong>有Token:</strong> {localStorageData.hasToken ? '是' : '否'}</p>
              <p><strong>有用户数据:</strong> {localStorageData.hasUser ? '是' : '否'}</p>
              <p><strong>Token:</strong> {localStorageData.token || '无'}</p>
              <p><strong>用户数据:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {localStorageData.user ? JSON.stringify(localStorageData.user, null, 2) : '无'}
              </pre>
            </div>
          </div>
        </div>

        {/* 测试操作 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          <div className="space-x-4">
            <button
              onClick={testTokenValidation}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              测试Token验证
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLocalStorageData({});
                alert('已清除localStorage');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              清除localStorage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              刷新页面
            </button>
          </div>
        </div>

        {/* 控制台日志 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">控制台日志</h2>
          <p className="text-sm text-gray-600">
            请打开浏览器开发者工具的控制台查看详细的调试信息。
          </p>
        </div>
      </div>
    </div>
  );
} 