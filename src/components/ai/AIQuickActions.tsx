'use client';

import React from 'react';

interface AIQuickActionsProps {
  onAction: (action: string) => void;
}

const quickActions = [
  {
    id: 'route-planning',
    label: '路线规划',
    icon: '🗺️',
    action: '我想规划一条旅行路线，请帮我推荐',
  },
  {
    id: 'weather-check',
    label: '天气查询',
    icon: '🌤️',
    action: '我想查询目的地的天气情况',
  },
  {
    id: 'equipment',
    label: '装备推荐',
    icon: '🎒',
    action: '我需要装备推荐，请告诉我应该带什么',
  },
  {
    id: 'safety',
    label: '安全建议',
    icon: '⚠️',
    action: '我想了解旅行安全注意事项',
  },
  {
    id: 'budget',
    label: '预算规划',
    icon: '💰',
    action: '我想了解旅行预算规划',
  },
  {
    id: 'emergency',
    label: '紧急帮助',
    icon: '🚨',
    action: '我需要紧急帮助信息',
  },
];

export default function AIQuickActions({ onAction }: AIQuickActionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium">快速操作：</p>
      <div className="grid grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.action)}
            className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs"
          >
            <span className="text-lg mb-1">{action.icon}</span>
            <span className="text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 