'use client';

import React, { useState } from 'react';
import type { AIRouteRequest, AIRouteRecommendation as AIRouteRecommendationType } from '@/types/ai';
import { AIService, RouteRecommendationRequest } from '@/services/ai';
import AIRouteRecommendation from '@/components/ai/AIRouteRecommendation';

export default function AIRoutePlanningPage() {
  const [routeRequest, setRouteRequest] = useState<AIRouteRequest>({
    startLocation: '',
    endLocation: '',
    duration: 24,
    travelType: 'car',
    preferences: {
      scenery: [],
      difficulty: 'medium',
      budget: 'medium',
      interests: [],
      avoidHighways: false,
      includeCamping: false,
    },
    constraints: {
      maxDistance: 500,
      mustVisit: [],
      avoidAreas: [],
    },
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const [error, setError] = useState<string | null>(null);
  const [aiService] = useState(() => AIService.getInstance());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // 构建AI服务请求
      const request: RouteRecommendationRequest = {
        startLocation: routeRequest.startLocation,
        endLocation: routeRequest.endLocation || undefined,
        duration: Math.ceil(routeRequest.duration / 24), // 转换为天数
        travelType: routeRequest.travelType,
        interests: routeRequest.preferences.interests,
        budget: routeRequest.preferences.budget,
        season: getCurrentSeason()
      };

      // 调用AI服务
      const response = await aiService.getRouteRecommendations(request);
      
      if (response.success && response.data) {
        setRecommendations([response.data]);
        setActiveTab('results');
      } else {
        setError(response.message || '获取推荐失败，请稍后再试');
      }
    } catch (error) {
      console.error('路线推荐请求失败:', error);
      setError('网络错误，请检查网络连接后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
  };

  const handleSave = (recommendation: any) => {
    console.log('保存路线:', recommendation);
    // 这里可以添加保存到用户收藏的逻辑
  };

  const handleShare = (recommendation: any) => {
    console.log('分享路线:', recommendation);
    // 这里可以添加分享逻辑
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI智能路线规划</h1>
          <p className="text-gray-600">基于你的偏好和需求，AI为你量身定制完美路线</p>
        </div>

        {/* 标签页导航 */}
        <div className="flex space-x-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'form'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            路线需求
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI推荐结果 {recommendations.length > 0 && `(${recommendations.length})`}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleRetry}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出发地 *
                  </label>
                  <input
                    type="text"
                    value={routeRequest.startLocation}
                    onChange={(e) => setRouteRequest(prev => ({ ...prev, startLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：北京"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目的地
                  </label>
                  <input
                    type="text"
                    value={routeRequest.endLocation}
                    onChange={(e) => setRouteRequest(prev => ({ ...prev, endLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：上海（可选）"
                  />
                </div>
              </div>

              {/* 时间和出行方式 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出行时间 (小时)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={routeRequest.duration}
                    onChange={(e) => setRouteRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出行方式
                  </label>
                  <select
                    value={routeRequest.travelType}
                    onChange={(e) => setRouteRequest(prev => ({ ...prev, travelType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="walking">徒步</option>
                    <option value="cycling">骑行</option>
                    <option value="motorcycle">摩托</option>
                    <option value="car">自驾</option>
                    <option value="rv">房车</option>
                  </select>
                </div>
              </div>

              {/* 偏好设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">偏好设置</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      难度等级
                    </label>
                    <select
                      value={routeRequest.preferences.difficulty}
                      onChange={(e) => setRouteRequest(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, difficulty: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">简单</option>
                      <option value="medium">中等</option>
                      <option value="hard">困难</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      预算范围
                    </label>
                    <select
                      value={routeRequest.preferences.budget}
                      onChange={(e) => setRouteRequest(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, budget: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">经济型</option>
                      <option value="medium">中等</option>
                      <option value="high">高端</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      兴趣标签
                    </label>
                    <input
                      type="text"
                      placeholder="例如：摄影,美食,历史"
                      onChange={(e) => setRouteRequest(prev => ({
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          interests: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isGenerating || !routeRequest.startLocation.trim()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>AI正在规划路线...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🤖</span>
                      <span>开始AI路线规划</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* 推荐头部 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">🎯</span>
                          <span className="text-sm text-gray-500">
                            生成时间: {new Date(recommendation.generatedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-700">推荐度:</span>
                            <span className="text-sm font-semibold text-green-600">
                              {recommendation.confidence ? (recommendation.confidence * 100).toFixed(0) : '85'}%
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full text-green-600 bg-green-100">
                              推荐
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(recommendation)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        保存路线
                      </button>
                    </div>

                    {/* AI分析内容 */}
                    <div className="mb-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700">
                          {recommendation.aiAnalysis}
                        </div>
                      </div>
                    </div>

                    {/* 数据来源 */}
                    {recommendation.sources && recommendation.sources.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <details className="text-sm text-gray-600">
                          <summary className="cursor-pointer hover:text-blue-600 transition-colors font-medium">
                            数据来源 ({recommendation.sources.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {recommendation.sources.map((source: string, index: number) => (
                              <div key={index} className="text-xs text-gray-500 flex items-start space-x-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{source}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有AI推荐结果</h3>
                <p className="text-gray-600 mb-6">请先填写路线需求，AI将为你生成个性化推荐</p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  开始规划
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 