'use client';

import React from 'react';
import { AIMessage } from '@/types/ai';

interface AIMessageItemProps {
  message: AIMessage;
  isTyping?: boolean;
}

export default function AIMessageItem({ message, isTyping }: AIMessageItemProps) {
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
            <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-2">
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
          <p className="text-xs text-gray-500 mt-1 ml-10">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return null;
} 