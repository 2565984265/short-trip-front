'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AIMessage, AIConversation, AIAssistantState } from '@/types/ai';
import { AIService } from '@/services/ai';
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

  const [aiService] = useState(() => AIService.getInstance());
  const [currentEventSource, setCurrentEventSource] = useState<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (currentEventSource) {
        currentEventSource.close();
      }
      aiService.disconnect();
    };
  }, [aiService, currentEventSource]);

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // 停止之前的流式响应
    if (currentEventSource) {
      currentEventSource.close();
      setCurrentEventSource(null);
    }

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

    // 设置AI正在处理状态
    setAssistantState(prev => ({ ...prev, isTyping: true, isProcessing: true }));

    try {
      // 使用流式响应
      await handleStreamResponse(content);
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

  // 处理流式响应
  const handleStreamResponse = async (query: string) => {
    let aiMessageId: string;
    let fullContent = '';

    // 创建占位符消息
    const placeholderMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    aiMessageId = placeholderMessage.id;

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, placeholderMessage],
      updatedAt: new Date(),
    }));

    // 开始流式响应
    const eventSource = aiService.streamMessage(
      query,
      // onMessage - 处理流式内容
      (chunk: string) => {
        fullContent += chunk;
        setConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullContent }
              : msg
          ),
          updatedAt: new Date(),
        }));
      },
      // onComplete - 处理完成
      (data: any) => {
        console.log('流式响应完成:', data);
        setConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  content: fullContent,
                  sources: data.sources,
                  intent: data.intent
                }
              : msg
          ),
          updatedAt: new Date(),
        }));
        setCurrentEventSource(null);
      },
      // onError - 处理错误
      (error: string) => {
        console.error('流式响应错误:', error);
        setConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullContent || '抱歉，我遇到了一些问题。请稍后再试。' }
              : msg
          ),
          updatedAt: new Date(),
        }));
        setCurrentEventSource(null);
      }
    );

    setCurrentEventSource(eventSource);
  };

  // 处理快速操作
  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  // 处理重新生成响应
  const handleRegenerateResponse = async (messageId: string) => {
    // 找到对应的用户消息
    const messages = conversation.messages;
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.role === 'user') {
        // 删除AI响应消息
        setConversation(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId),
          updatedAt: new Date(),
        }));
        
        // 重新发送用户消息
        await handleStreamResponse(userMessage.content);
      }
    }
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
            onRegenerate={message.role === 'assistant' ? () => handleRegenerateResponse(message.id) : undefined}
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