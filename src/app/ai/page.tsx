'use client';
import { useState } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AIService } from '@/services/ai';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
}

const quickQuestions = [
  "推荐一个适合周末的短途旅行路线",
  "如何规划一次完美的自驾游？",
  "旅行中如何省钱？",
  "推荐一些适合拍照的景点",
  "如何选择旅行住宿？"
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是你的AI旅行助手，可以帮你规划行程、推荐景点、解答旅行问题。有什么我可以帮助你的吗？',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => AIService.getInstance());

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // 使用真实的AI服务
      const response = await aiService.sendMessage({
        message: currentInput,
        conversationId: 'ai-page-conversation'
      });

      console.log('AI服务响应:', response);
      
      if (response.success && response.data) {
        console.log('AI响应数据:', response.data);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.content,
          isUser: false,
          timestamp: response.data.timestamp ? new Date(response.data.timestamp) : new Date(),
          sources: response.data.sources
        };
        console.log('创建的AI消息:', aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.log('AI服务返回错误:', response);
        // 错误处理
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.message || '抱歉，我遇到了一些问题。请稍后再试。',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI请求失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 text-blue-500 mr-2" />
              <h1 className="text-4xl font-bold text-gray-900">AI旅行助手</h1>
            </div>
            <p className="text-lg text-gray-600">智能规划你的完美旅程</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 聊天区域 */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        message.isUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                      {message.sources && message.sources.length > 0 && (
                        <span className="text-xs text-blue-500 ml-2">
                          📚 {message.sources.length} 个来源
                        </span>
                      )}
                    </div>
                    
                    {/* 显示数据来源 */}
                    {message.sources && message.sources.length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          查看数据来源
                        </summary>
                        <div className="mt-1 space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-gray-600">
                              • {source}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm">AI正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 快速问题 */}
            <div className="border-t border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-3">快速问题：</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* 输入区域 */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入你的问题..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 功能介绍 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">智能推荐</h3>
              <p className="text-gray-600 text-sm">基于平台指南和社区数据，智能推荐最适合的旅行路线和景点</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">实时解答</h3>
              <p className="text-gray-600 text-sm">24小时在线，基于真实数据解答你的旅行问题，提供专业建议</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">个性化服务</h3>
              <p className="text-gray-600 text-sm">根据你的具体情况，提供个性化的旅行建议和规划方案</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 