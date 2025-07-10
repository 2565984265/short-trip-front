'use client';

import React, { useState } from 'react';
import type { AIRouteRecommendation } from '@/types/ai';
import Link from 'next/link';

interface AIRouteRecommendationProps {
  recommendation: AIRouteRecommendation;
  onSave?: (recommendation: AIRouteRecommendation) => void;
  onShare?: (recommendation: AIRouteRecommendation) => void;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const transportationIcons = {
  walking: '🚶',
  cycling: '🚴',
  motorcycle: '🏍️',
  car: '🚗',
  rv: '🚐',
};

const transportationLabels = {
  walking: '徒步',
  cycling: '骑行',
  motorcycle: '摩托',
  car: '自驾',
  rv: '房车',
};

export default function AIRouteRecommendation({ 
  recommendation, 
  onSave, 
  onShare 
}: AIRouteRecommendationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'waypoints' | 'equipment' | 'tips'>('overview');

  const handleSave = () => {
    onSave?.(recommendation);
  };

  const handleShare = () => {
    onShare?.(recommendation);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部信息 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {recommendation.title}
            </h3>
            <p className="text-gray-600 mb-3">{recommendation.description}</p>
            
            {/* 路线基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendation.route.totalDistance}km
                </div>
                <div className="text-sm text-gray-500">总距离</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recommendation.route.estimatedTime}h
                </div>
                <div className="text-sm text-gray-500">预计时间</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recommendation.waypoints.length}
                </div>
                <div className="text-sm text-gray-500">途经点</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(recommendation.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">推荐度</div>
              </div>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${difficultyColors[recommendation.route.difficulty]}`}>
                {difficultyLabels[recommendation.route.difficulty]}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {transportationIcons[recommendation.route.transportation as keyof typeof transportationIcons]}
                {transportationLabels[recommendation.route.transportation as keyof typeof transportationLabels]}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              保存路线
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              分享
            </button>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('waypoints')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'waypoints'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            途经点 ({recommendation.waypoints.length})
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'equipment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            装备清单 ({recommendation.equipment.length})
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tips'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            建议
          </button>
        </nav>
      </div>

      {/* 标签页内容 */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 亮点 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">路线亮点</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendation.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 天气建议 */}
            {recommendation.weatherAdvice && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">天气建议</h4>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                  {recommendation.weatherAdvice}
                </p>
              </div>
            )}

            {/* 最佳时间 */}
            {recommendation.bestTime && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">最佳出行时间</h4>
                <p className="text-gray-700">{recommendation.bestTime}</p>
              </div>
            )}

            {/* 地图链接 */}
            <div>
              <Link
                href={`/map?route=${recommendation.id}`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="mr-2">🗺️</span>
                在地图中查看
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'waypoints' && (
          <div className="space-y-4">
            {recommendation.waypoints.map((waypoint, index) => (
              <div key={waypoint.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {index + 1}.
                    </span>
                    <h5 className="font-medium text-gray-900">{waypoint.name}</h5>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {waypoint.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {waypoint.estimatedTime}分钟
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{waypoint.description}</p>
                {waypoint.tips && waypoint.tips.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">小贴士：</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {waypoint.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-4">
            {recommendation.equipment.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.isRequired && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        必需
                      </span>
                    )}
                    {item.price && (
                      <span className="text-sm text-gray-500">
                        ¥{item.price}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{item.category}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-6">
            {/* 建议 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">实用建议</h4>
              <div className="space-y-2">
                {recommendation.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">💡</span>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 注意事项 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">注意事项</h4>
              <div className="space-y-2">
                {recommendation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">⚠️</span>
                    <span className="text-gray-700">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 