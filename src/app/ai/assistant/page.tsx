'use client';

import React, { useState } from 'react';
import AIAssistant from '@/components/ai/AIAssistant';

export default function AIAssistantPage() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI旅行助手</h1>
          <p className="text-gray-600">你的专属旅行顾问，24小时在线为你解答问题</p>
        </div>

        {/* 功能介绍 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🗺️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">智能路线规划</h3>
            <p className="text-gray-600 text-sm">
              根据你的时间、偏好和出行方式，AI为你量身定制完美路线
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">🌤️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">天气路况分析</h3>
            <p className="text-gray-600 text-sm">
              实时查询目的地天气，分析路况信息，为你提供出行建议
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-xl">🎒</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">装备推荐</h3>
            <p className="text-gray-600 text-sm">
              根据出行方式和目的地，推荐合适的装备清单
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">安全建议</h3>
            <p className="text-gray-600 text-sm">
              提供路线安全评估，紧急联系方式，应急预案等
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-yellow-600 text-xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">预算规划</h3>
            <p className="text-gray-600 text-sm">
              帮你估算交通、住宿、餐饮等费用，制定合理预算
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-indigo-600 text-xl">🏨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">住宿推荐</h3>
            <p className="text-gray-600 text-sm">
              根据你的预算和偏好，推荐合适的住宿选择
            </p>
          </div>
        </div>

        {/* 使用指南 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">如何使用AI助手</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. 开始对话</h3>
              <p className="text-gray-600 text-sm mb-4">
                点击右下角的AI助手按钮，开始与AI对话。你可以直接描述你的旅行需求，比如：
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "我想去张家界玩3天，有什么推荐？"</li>
                <li>• "周末想找个地方徒步，有什么建议？"</li>
                <li>• "去西藏需要准备什么装备？"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. 获取建议</h3>
              <p className="text-gray-600 text-sm mb-4">
                AI会根据你的需求，提供个性化的建议和推荐：
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 路线规划和行程安排</li>
                <li>• 装备清单和注意事项</li>
                <li>• 天气信息和最佳时间</li>
                <li>• 预算估算和安全提醒</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">常见问题</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Q: AI助手能帮我规划多长时间的路线？</h3>
              <p className="text-gray-600 text-sm">
                A: AI助手可以帮你规划从几小时到几周的路线，包括一日游、周末游、长假游等。只需要告诉AI你的可用时间，它就会为你推荐合适的路线。
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Q: AI推荐的信息准确吗？</h3>
              <p className="text-gray-600 text-sm">
                A: AI助手基于大量的旅行数据和用户反馈进行推荐，但建议你结合实际情况和最新信息进行判断。对于重要的安全信息，建议多渠道核实。
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Q: 可以保存AI推荐的路线吗？</h3>
              <p className="text-gray-600 text-sm">
                A: 是的，你可以保存AI推荐的路线到个人收藏，方便后续查看和分享。保存的路线会同步到你的账户中。
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Q: AI助手支持哪些出行方式？</h3>
              <p className="text-gray-600 text-sm">
                A: AI助手支持徒步、骑行、摩托、自驾、房车等多种出行方式，会根据不同的出行方式提供相应的建议和注意事项。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI助手浮动窗口 */}
      {isAssistantOpen && (
        <AIAssistant
          onClose={() => setIsAssistantOpen(false)}
          isMinimized={isAssistantMinimized}
          onMinimize={() => setIsAssistantMinimized(!isAssistantMinimized)}
        />
      )}

      {/* 启动AI助手按钮 */}
      {!isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
} 