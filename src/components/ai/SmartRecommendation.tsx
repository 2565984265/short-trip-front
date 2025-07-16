'use client';

import React, { useState, useEffect } from 'react';
import { AIService, RouteRecommendationRequest } from '@/services/ai';

interface UserPreferences {
  duration?: number;
  travelType?: string;
  interests?: string[];
  budget?: string;
  startLocation?: string;
  endLocation?: string;
  season?: string;
}

interface SmartRecommendationProps {
  userPreferences: UserPreferences;
  currentLocation?: [number, number];
  onRouteSelect?: (route: any) => void;
  onError?: (error: string) => void;
}

interface RouteRecommendation {
  id: string;
  aiAnalysis: string;
  confidence: number;
  sources: string[];
  generatedAt: string;
}

export default function SmartRecommendation({ 
  userPreferences, 
  currentLocation, 
  onRouteSelect,
  onError 
}: SmartRecommendationProps) {
  const [recommendations, setRecommendations] = useState<RouteRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiService] = useState(() => AIService.getInstance());
  const [currentRequest, setCurrentRequest] = useState<RouteRecommendationRequest | null>(null);

  // 当用户偏好改变时自动获取推荐 - 修复依赖项问题
  useEffect(() => {
    if (userPreferences.duration || userPreferences.travelType) {
      getRecommendations();
    }
  }, [
    userPreferences.duration,
    userPreferences.travelType,
    userPreferences.startLocation,
    userPreferences.budget,
    userPreferences.season,
    // 将 interests 数组转换为字符串来避免引用比较问题
    userPreferences.interests?.join(',') || '',
    userPreferences.endLocation
  ]);

  const getRecommendations = async () => {
    setLoading(true);
    
    try {
      const request: RouteRecommendationRequest = {
        startLocation: currentLocation ? `${currentLocation[0]},${currentLocation[1]}` : userPreferences.startLocation,
        endLocation: userPreferences.endLocation,
        duration: userPreferences.duration,
        travelType: userPreferences.travelType,
        interests: userPreferences.interests,
        budget: userPreferences.budget,
        season: userPreferences.season || getCurrentSeason()
      };
      
      setCurrentRequest(request);
      
      const response = await aiService.getRouteRecommendations(request);
      
      if (response.success && response.data) {
        setRecommendations([response.data]);
      } else {
        onError?.(response.message || '获取推荐失败');
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
      onError?.('获取推荐失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
  };

  const handleRouteSelect = (recommendation: RouteRecommendation) => {
    onRouteSelect?.(recommendation);
  };

  const handleRefresh = () => {
    getRecommendations();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return '高度推荐';
    if (confidence >= 0.6) return '推荐';
    return '谨慎考虑';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">AI正在分析您的偏好...</span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-2">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI智能推荐</h3>
          <p className="text-gray-600 mb-4">
            完善您的旅行偏好，我会为您推荐最适合的路线
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            获取推荐
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          🤖 AI智能推荐
          <span className="ml-2 text-sm font-normal text-gray-500">
            基于您的偏好定制
          </span>
        </h3>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="刷新推荐"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {recommendations.map((recommendation) => (
        <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                    <span className={`text-sm font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                      {(recommendation.confidence * 100).toFixed(0)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(recommendation.confidence)} bg-opacity-10`}>
                      {getConfidenceLabel(recommendation.confidence)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRouteSelect(recommendation)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                选择此路线
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
                    {recommendation.sources.map((source, index) => (
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
      ))}

      {/* 当前请求信息 */}
      {currentRequest && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">当前查询条件:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {currentRequest.startLocation && (
              <div>出发地: {currentRequest.startLocation}</div>
            )}
            {currentRequest.endLocation && (
              <div>目的地: {currentRequest.endLocation}</div>
            )}
            {currentRequest.duration && (
              <div>时长: {currentRequest.duration}天</div>
            )}
            {currentRequest.travelType && (
              <div>出行方式: {currentRequest.travelType}</div>
            )}
            {currentRequest.budget && (
              <div>预算: {currentRequest.budget}</div>
            )}
            {currentRequest.season && (
              <div>季节: {currentRequest.season}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 