'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AIMessage, AIConversation, AIAssistantState } from '@/types/ai';
import AIMessageItem from './AIMessageItem';
import AIInputBox from './AIInputBox';
import AIQuickActions from './AIQuickActions';

interface AIAssistantProps {
  conversationId?: string;
  onClose?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

export default function AIAssistant({ 
  conversationId, 
  onClose, 
  isMinimized = false,
  onMinimize 
}: AIAssistantProps) {
  const [conversation, setConversation] = useState<AIConversation>({
    id: conversationId || 'default',
    title: 'AI旅行助手',
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的AI旅行助手 🤖 我可以帮你：\n\n• 规划个性化路线\n• 分析天气和路况\n• 推荐装备和住宿\n• 提供安全建议\n• 回答旅行问题\n\n请告诉我你的旅行需求，我会为你提供专业的建议！',
        timestamp: new Date(),
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  });

  const [assistantState, setAssistantState] = useState<AIAssistantState>({
    isTyping: false,
    isProcessing: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // 添加用户消息
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: new Date(),
    }));

    // 设置AI正在输入状态
    setAssistantState(prev => ({ ...prev, isTyping: true, isProcessing: true }));

    try {
      // 模拟AI响应
      await simulateAIResponse(content);
    } catch (error) {
      console.error('AI响应错误:', error);
      // 添加错误消息
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试，或者尝试重新描述你的需求。',
        timestamp: new Date(),
      };
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date(),
      }));
    } finally {
      setAssistantState(prev => ({ ...prev, isTyping: false, isProcessing: false }));
    }
  };

  // 模拟AI响应
  const simulateAIResponse = async (userInput: string) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let response = '';
    
    // 简单的关键词匹配逻辑
    if (userInput.includes('路线') || userInput.includes('规划') || userInput.includes('推荐')) {
      response = `我来为你推荐一些精彩的路线！🎯\n\n请告诉我：\n• 你的出发地\n• 出行时间（几小时/几天）\n• 出行方式（徒步/骑行/自驾等）\n• 你喜欢的风景类型（山水/古镇/海边等）\n\n这样我就能为你量身定制完美的旅行路线了！`;
    } else if (userInput.includes('天气') || userInput.includes('气候')) {
      response = `🌤️ 天气信息很重要！\n\n请告诉我你要去的目的地和时间，我可以为你提供：\n• 实时天气状况\n• 未来几天的天气预报\n• 最佳出行时间建议\n• 天气相关的装备建议`;
    } else if (userInput.includes('装备') || userInput.includes('准备') || userInput.includes('带什么')) {
      response = `🎒 装备准备是成功旅行的关键！\n\n请告诉我：\n• 你的出行方式\n• 旅行时长\n• 目的地类型\n• 季节\n\n我会为你列出详细的装备清单，包括必需品和可选物品。`;
    } else if (userInput.includes('安全') || userInput.includes('危险') || userInput.includes('注意')) {
      response = `⚠️ 安全永远是第一位的！\n\n我可以为你提供：\n• 路线安全评估\n• 天气风险提醒\n• 紧急联系方式\n• 安全装备建议\n• 应急预案\n\n请告诉我你的具体行程，我会进行详细的安全分析。`;
    } else if (userInput.includes('预算') || userInput.includes('花费') || userInput.includes('费用')) {
      response = `💰 预算规划很重要！\n\n我可以帮你估算：\n• 交通费用\n• 住宿费用\n• 餐饮费用\n• 装备费用\n• 门票和活动费用\n\n请告诉我你的旅行计划，我会为你制定详细的预算方案。`;
    } else {
      response = `感谢你的提问！🤖\n\n我可以帮你：\n• 📍 规划个性化路线\n• 🌤️ 查询天气信息\n• 🎒 推荐装备清单\n• ⚠️ 提供安全建议\n• 💰 制定预算计划\n• 🏨 推荐住宿和餐厅\n\n请具体描述你的需求，我会为你提供专业的建议！`;
    }

    const aiMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, aiMessage],
      updatedAt: new Date(),
    }));
  };

  // 处理快速操作
  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onMinimize}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">AI旅行助手</h3>
            <p className="text-xs text-blue-100">
              {assistantState.isTyping ? '正在输入...' : '在线'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => (
          <AIMessageItem
            key={message.id}
            message={message}
            isTyping={assistantState.isTyping && message.id === conversation.messages[conversation.messages.length - 1]?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 快速操作 */}
      <div className="px-4 pb-2">
        <AIQuickActions onAction={handleQuickAction} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200">
        <AIInputBox
          onSend={handleSendMessage}
          disabled={assistantState.isProcessing}
          placeholder="告诉我你的旅行需求..."
        />
      </div>
    </div>
  );
} 