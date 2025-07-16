'use client';

import React, { useState } from 'react';
import type { GuideFilter } from '@/types/guide';

interface GuideFilterProps {
  filter: GuideFilter;
  onFilterChange: (filter: GuideFilter) => void;
}

const transportModeOptions = [
  { value: '步行', label: '步行', icon: '🚶' },
  { value: '骑行', label: '骑行', icon: '🚴' },
  { value: '摩托', label: '摩托', icon: '🏍️' },
  { value: '自驾', label: '自驾', icon: '🚗' },
  { value: '包车', label: '包车', icon: '🚐' },
];

const difficultyOptions = [
  { value: 'EASY', label: '简单', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DIFFICULT', label: '困难', color: 'bg-orange-100 text-orange-800' },
  { value: 'EXPERT', label: '专家', color: 'bg-red-100 text-red-800' },
];

export default function GuideFilter({ filter, onFilterChange }: GuideFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTransportModeChange = (transportMode: string) => {
    onFilterChange({
      ...filter,
      transportMode: filter.transportMode === transportMode ? undefined : transportMode,
    });
  };

  const handleDifficultyChange = (difficultyLevel: string) => {
    onFilterChange({
      ...filter,
      difficultyLevel: filter.difficultyLevel === difficultyLevel ? undefined : difficultyLevel,
    });
  };

  const handleDestinationChange = (destination: string) => {
    onFilterChange({
      ...filter,
      destination: destination || undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      {/* 快速筛选 */}
      <div className="mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">出行方式</label>
          <div className="flex flex-wrap gap-2">
            {transportModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTransportModeChange(option.value)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filter.transportMode === option.value
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDifficultyChange(option.value)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filter.difficultyLevel === option.value
                    ? `${option.color} border-current`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 详细筛选 */}
      {isExpanded && (
        <div className="border-t pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              type="text"
              placeholder="输入城市或地区名称"
              value={filter.destination || ''}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* 清除筛选 */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            清除所有筛选条件
          </button>
        </div>
      )}
    </div>
  );
} 