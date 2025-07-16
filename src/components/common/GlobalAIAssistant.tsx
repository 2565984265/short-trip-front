'use client';

import React, { useState, useEffect } from 'react';
import AIAssistant from '@/components/ai/AIAssistant';

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 检查当前页面是否应该显示AI助手
  useEffect(() => {
    const checkVisibility = () => {
      const currentPath = window.location.pathname;
      // 在AI专门页面隐藏全局助手
      const hideOnPaths = ['/ai', '/ai/assistant', '/ai/route-planning'];
      setIsVisible(!hideOnPaths.includes(currentPath));
    };

    checkVisibility();
    
    // 监听路由变化
    const handleRouteChange = () => {
      checkVisibility();
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* AI助手浮动窗口 */}
      {isOpen && (
        <AIAssistant
          conversationId="global-ai-assistant"
          onClose={() => setIsOpen(false)}
          isMinimized={isMinimized}
          onMinimize={() => setIsMinimized(!isMinimized)}
        />
      )}

      {/* AI助手启动按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
          title="AI旅行助手"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            
            {/* 脉冲动画 */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* 提示文本 */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            🤖 AI旅行助手
          </div>
        </button>
      )}
    </>
  );
} 