'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SectionTitle from '@/components/common/SectionTitle';

// 动态导入地图组件，避免SSR问题
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-white rounded-xl shadow-sm flex items-center justify-center">
      <div className="text-gray-500">地图加载中...</div>
    </div>
  ),
});

// 示例数据
const sampleMarkers = [
  { position: [39.9042, 116.4074] as [number, number], title: '天安门广场', description: '中国最大的城市广场', type: 'scenic' as const },
  { position: [39.9163, 116.3972] as [number, number], title: '故宫博物院', description: '明清两代皇家宫殿', type: 'scenic' as const },
  { position: [39.9087, 116.3975] as [number, number], title: '王府井小吃街', description: '北京著名商业街', type: 'supply' as const },
  { position: [39.9999, 116.3972] as [number, number], title: '奥林匹克森林公园', description: '适合露营和户外活动', type: 'camping' as const },
];

const sampleRoutes = [
  {
    coordinates: [
      [39.9042, 116.4074],
      [39.9163, 116.3972],
      [39.9087, 116.3975],
    ] as [number, number][],
    color: '#ff6b6b',
    name: '经典北京一日游',
  },
];

export default function MapPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showRoutes, setShowRoutes] = useState(true);

  const filteredMarkers = selectedType === 'all' 
    ? sampleMarkers 
    : sampleMarkers.filter(marker => marker.type === selectedType);

  const displayedRoutes = showRoutes ? sampleRoutes : [];

  return (
    <div className="container mx-auto px-4">
      <div className="mb-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">旅行地图</h1>
        <p className="text-lg text-gray-600">探索景点、补给点和露营地点，规划你的完美路线</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 transition-all hover:shadow-md">
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">筛选标记类型</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">全部</option>
              <option value="scenic">景点</option>
              <option value="supply">补给点</option>
              <option value="camping">露营点</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showRoutes"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="showRoutes" className="text-sm text-gray-700">显示推荐路线</label>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">景点</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="text-sm text-gray-600">补给点</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">露营点</span>
            </div>
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <Map
          center={[39.9042, 116.4074]}
          zoom={12}
          markers={filteredMarkers}
          routes={displayedRoutes}
        />
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard value={sampleMarkers.filter(m => m.type === 'scenic').length} label="景点数量" color="text-red-500" />
        <StatCard value={sampleMarkers.filter(m => m.type === 'supply').length} label="补给点数量" color="text-teal-500" />
        <StatCard value={sampleMarkers.filter(m => m.type === 'camping').length} label="露营点数量" color="text-blue-500" />
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ value, label, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md transform hover:-translate-y-1">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </div>
  );
}