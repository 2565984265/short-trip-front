'use client';

import React from 'react';
import { AIMessage } from '@/types/ai';

interface AIMessageItemProps {
  message: AIMessage;
  isTyping?: boolean;
  onRegenerate?: () => void;
}

export default function AIMessageItem({ message, isTyping, onRegenerate }: AIMessageItemProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-blue-600 text-white rounded-lg rounded-br-none px-4 py-2">
            <p className="text-sm whitespace-pre-wrap">{formatContent(message.content)}</p>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs lg:max-w-md">
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-2 flex-1">
              {isTyping ? (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">AI正在思考...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {formatContent(message.content)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1 ml-10">
            <p className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
              {message.sources && message.sources.length > 0 && (
                <span className="ml-2 text-blue-500">
                  · {message.sources.length} 个来源
                </span>
              )}
            </p>
            
            {/* 操作按钮 */}
            {!isTyping && onRegenerate && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onRegenerate}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                  title="重新生成回答"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* 数据来源 */}
          {message.sources && message.sources.length > 0 && !isTyping && (
            <div className="mt-2 ml-10">
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-blue-500 transition-colors">
                  数据来源 ({message.sources.length})
                </summary>
                <div className="mt-1 space-y-1">
                  {message.sources.map((source, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      • {source}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
} 