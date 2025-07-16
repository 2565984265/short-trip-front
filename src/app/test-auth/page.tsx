'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function TestAuthPage() {
  const { user, token, isAuthenticated, loading } = useUser();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      testAuth();
    }
  }, []);

  const testAuth = async () => {
    const results: string[] = [];
    
    // 检查localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    results.push(`localStorage token: ${savedToken ? savedToken.substring(0, 20) + '...' : 'null'}`);
    results.push(`localStorage user: ${savedUser ? 'exists' : 'null'}`);
    
    // 检查UserContext状态
    results.push(`UserContext isAuthenticated: ${isAuthenticated}`);
    results.push(`UserContext user: ${user ? user.username : 'null'}`);
    results.push(`UserContext token: ${token ? token.substring(0, 20) + '...' : 'null'}`);
    results.push(`UserContext loading: ${loading}`);
    
    // 测试API调用
    if (savedToken) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        results.push(`API /api/auth/me status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          results.push(`API /api/auth/me response: ${JSON.stringify(data, null, 2)}`);
        } else {
          const errorText = await response.text();
          results.push(`API /api/auth/me error: ${errorText}`);
        }
      } catch (error) {
        results.push(`API /api/auth/me error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setTestResults(results);
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">认证状态测试</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono text-sm bg-gray-100 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="space-x-4">
            <button
              onClick={testAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              重新测试
            </button>
            <button
              onClick={clearStorage}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              清除存储
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 