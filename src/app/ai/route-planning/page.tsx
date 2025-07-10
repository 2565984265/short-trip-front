'use client';

import React, { useState } from 'react';
import type { AIRouteRequest, AIRouteRecommendation as AIRouteRecommendationType } from '@/types/ai';
import AIRouteRecommendation from '@/components/ai/AIRouteRecommendation';

// 模拟AI路线推荐结果
const mockRecommendations: AIRouteRecommendationType[] = [
  {
    id: '1',
    title: '张家界三日游完美路线',
    description: '结合张家界国家森林公园、天门山和黄龙洞的经典三日游路线，适合家庭出游。',
    route: {
      coordinates: [
        [29.3271, 110.4792],
        [29.0556, 110.4792],
        [29.3271, 110.4792],
      ],
      totalDistance: 120,
      estimatedTime: 72,
      difficulty: 'medium',
      transportation: 'car',
    },
    waypoints: [
      {
        id: '1',
        name: '张家界国家森林公园',
        type: 'scenic',
        coordinates: [29.3271, 110.4792],
        description: '世界自然遗产，以奇特的石柱群闻名',
        estimatedTime: 240,
        rating: 4.8,
        tips: ['建议提前预订门票', '准备雨具'],
      },
      {
        id: '2',
        name: '天门山',
        type: 'scenic',
        coordinates: [29.0556, 110.4792],
        description: '天门山玻璃栈道，挑战你的勇气',
        estimatedTime: 180,
        rating: 4.7,
        tips: ['恐高者慎入', '注意安全'],
      },
      {
        id: '3',
        name: '黄龙洞',
        type: 'scenic',
        coordinates: [29.3271, 110.4792],
        description: '亚洲最大的溶洞之一',
        estimatedTime: 120,
        rating: 4.6,
        tips: ['洞内较凉，带外套'],
      },
    ],
    highlights: ['玻璃栈道', '天门山', '黄龙洞', '袁家界', '金鞭溪'],
    tips: [
      '建议提前预订门票，旺季需要提前3-7天',
      '准备雨具，张家界多雨',
      '穿舒适的运动鞋，景区内步行距离较长',
      '带足饮用水和零食',
      '注意防晒，景区内遮阳设施有限',
    ],
    warnings: [
      '玻璃栈道有恐高症者慎入',
      '景区内注意安全，不要攀爬危险区域',
      '雨季路滑，注意防滑',
    ],
    equipment: [
      {
        category: 'clothing',
        name: '舒适运动鞋',
        description: '防滑、透气、舒适的运动鞋',
        isRequired: true,
        price: 200,
      },
      {
        category: 'gear',
        name: '雨衣或雨伞',
        description: '防雨装备，张家界多雨',
        isRequired: true,
        price: 30,
      },
      {
        category: 'electronics',
        name: '相机',
        description: '记录美好瞬间',
        isRequired: false,
        price: 3000,
      },
    ],
    weatherAdvice: '张家界春季多雨，建议携带雨具。夏季炎热，注意防晒。秋季天气最佳，是旅游的黄金季节。',
    bestTime: '3-5月和9-11月，避开暑假和国庆假期',
    confidence: 0.92,
  },
  {
    id: '2',
    title: '莫干山徒步一日游',
    description: '杭州周边莫干山徒步路线，享受竹林清风，体验江南山水的诗意。',
    route: {
      coordinates: [
        [30.5444, 119.8644],
        [30.5444, 119.8644],
      ],
      totalDistance: 8,
      estimatedTime: 4,
      difficulty: 'easy',
      transportation: 'walking',
    },
    waypoints: [
      {
        id: '1',
        name: '竹林小径',
        type: 'scenic',
        coordinates: [30.5444, 119.8644],
        description: '漫步竹林，感受清风徐来',
        estimatedTime: 60,
        rating: 4.5,
        tips: ['穿舒适鞋子', '带足饮用水'],
      },
      {
        id: '2',
        name: '观景台',
        type: 'scenic',
        coordinates: [30.5444, 119.8644],
        description: '俯瞰莫干山全景',
        estimatedTime: 30,
        rating: 4.6,
        tips: ['最佳观景时间：日出或日落'],
      },
    ],
    highlights: ['竹林小径', '观景台', '古村落', '清新空气'],
    tips: [
      '穿舒适鞋子，带足饮用水',
      '建议早上出发，避开正午高温',
      '可以带些零食，在观景台休息',
      '注意天气，雨天路滑',
    ],
    warnings: [
      '注意天气变化',
      '不要偏离主路',
      '带好垃圾袋，保护环境',
    ],
    equipment: [
      {
        category: 'clothing',
        name: '舒适徒步鞋',
        description: '防滑、透气的徒步鞋',
        isRequired: true,
        price: 150,
      },
      {
        category: 'gear',
        name: '水壶',
        description: '带足饮用水',
        isRequired: true,
        price: 50,
      },
    ],
    weatherAdvice: '春秋季节最适合徒步，夏季炎热，冬季可能有雪。',
    bestTime: '3-5月和9-11月',
    confidence: 0.88,
  },
];

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

  const [recommendations, setRecommendations] = useState<AIRouteRecommendationType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // 模拟AI生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟AI推荐结果
    setRecommendations(mockRecommendations);
    setActiveTab('results');
    setIsGenerating(false);
  };

  const handleSave = (recommendation: AIRouteRecommendationType) => {
    console.log('保存路线:', recommendation);
    // 这里可以添加保存到用户收藏的逻辑
  };

  const handleShare = (recommendation: AIRouteRecommendationType) => {
    console.log('分享路线:', recommendation);
    // 这里可以添加分享逻辑
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出行时间（小时）*
                  </label>
                  <input
                    type="number"
                    value={routeRequest.duration}
                    onChange={(e) => setRouteRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="168"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出行方式 *
                  </label>
                  <select
                    value={routeRequest.travelType}
                    onChange={(e) => setRouteRequest(prev => ({ ...prev, travelType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">偏好设置</h3>
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
                      最大距离（公里）
                    </label>
                    <input
                      type="number"
                      value={routeRequest.constraints?.maxDistance}
                      onChange={(e) => setRouteRequest(prev => ({ 
                        ...prev, 
                        constraints: { ...prev.constraints, maxDistance: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="5000"
                    />
                  </div>
                </div>
              </div>

              {/* 兴趣偏好 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  兴趣偏好（可选）
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['山水', '古镇', '海边', '森林', '草原', '沙漠', '雪山', '湖泊'].map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={routeRequest.preferences.interests?.includes(interest)}
                        onChange={(e) => {
                          const currentInterests = routeRequest.preferences.interests || [];
                          const newInterests = e.target.checked
                            ? [...currentInterests, interest]
                            : currentInterests.filter(i => i !== interest);
                          setRouteRequest(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, interests: newInterests }
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 其他选项 */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={routeRequest.preferences.avoidHighways}
                    onChange={(e) => setRouteRequest(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, avoidHighways: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">避开高速公路</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={routeRequest.preferences.includeCamping}
                    onChange={(e) => setRouteRequest(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, includeCamping: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">包含露营点</span>
                </label>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isGenerating}
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
              recommendations.map((recommendation) => (
                <AIRouteRecommendation
                  key={recommendation.id}
                  recommendation={recommendation}
                  onSave={handleSave}
                  onShare={handleShare}
                />
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