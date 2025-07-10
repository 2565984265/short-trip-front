'use client';

import React, { useState } from 'react';
import type { GuideFilter } from '@/types/guide';

interface GuideFilterProps {
  filter: GuideFilter;
  onFilterChange: (filter: GuideFilter) => void;
}

const transportationOptions = [
  { value: 'walking', label: '徒步', icon: '🚶' },
  { value: 'cycling', label: '骑行', icon: '🚴' },
  { value: 'motorcycle', label: '摩托', icon: '🏍️' },
  { value: 'car', label: '自驾', icon: '🚗' },
  { value: 'rv', label: '房车', icon: '🚐' },
];

const difficultyOptions = [
  { value: 'easy', label: '简单', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: '困难', color: 'bg-red-100 text-red-800' },
];

export default function GuideFilter({ filter, onFilterChange }: GuideFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTransportationChange = (transportation: string) => {
    onFilterChange({
      ...filter,
      transportation: filter.transportation === transportation ? undefined : transportation as any,
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({
      ...filter,
      difficulty: filter.difficulty === difficulty ? undefined : difficulty as any,
    });
  };

  const handleDurationChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    const currentDuration = filter.duration || {};
    onFilterChange({
      ...filter,
      duration: {
        ...currentDuration,
        [type]: numValue,
      },
    });
  };

  const handleDistanceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    const currentDistance = filter.distance || {};
    onFilterChange({
      ...filter,
      distance: {
        ...currentDistance,
        [type]: numValue,
      },
    });
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({
      ...filter,
      location: location || undefined,
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
            {transportationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTransportationChange(option.value)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filter.transportation === option.value
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
                  filter.difficulty === option.value
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">时长范围（小时）</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="最小"
                  value={filter.duration?.min || ''}
                  onChange={(e) => handleDurationChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  placeholder="最大"
                  value={filter.duration?.max || ''}
                  onChange={(e) => handleDurationChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">距离范围（公里）</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="最小"
                  value={filter.distance?.min || ''}
                  onChange={(e) => handleDistanceChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  placeholder="最大"
                  value={filter.distance?.max || ''}
                  onChange={(e) => handleDistanceChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              type="text"
              placeholder="输入城市或地区名称"
              value={filter.location || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
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