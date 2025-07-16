'use client';

import React, { useState } from 'react';
import Map from '@/components/Map';
import { Route, TravelMode } from '@/types/route';

const sampleMarkers = [
  { position: [39.9042, 116.4074] as [number, number], name: '天安门广场', description: '北京市中心的重要地标' },
  { position: [39.9163, 116.3972] as [number, number], name: '故宫', description: '明清两代皇宫' },
  { position: [39.9234, 116.3972] as [number, number], name: '景山公园', description: '俯瞰紫禁城的最佳地点' },
  { position: [39.9999, 116.2755] as [number, number], name: '颐和园', description: '中国古典园林的杰作' },
  { position: [40.3569, 116.0241] as [number, number], name: '八达岭长城', description: '万里长城的代表性段落' },
];

// POI类型选项 - 与后端GSIType枚举保持一致
const POI_TYPES = [
  // 自然景观
  { value: 'MOUNTAIN', label: '山峰' },
  { value: 'LAKE', label: '湖泊' },
  { value: 'RIVER', label: '河流' },
  { value: 'FOREST', label: '森林' },
  { value: 'BEACH', label: '海滩' },
  { value: 'WATERFALL', label: '瀑布' },
  { value: 'CAVE', label: '洞穴' },
  
  // 人文景观
  { value: 'TEMPLE', label: '寺庙' },
  { value: 'MUSEUM', label: '博物馆' },
  { value: 'PARK', label: '公园' },
  { value: 'SQUARE', label: '广场' },
  { value: 'BRIDGE', label: '桥梁' },
  { value: 'TOWER', label: '塔楼' },
  
  // 交通设施
  { value: 'STATION', label: '车站' },
  { value: 'AIRPORT', label: '机场' },
  { value: 'PORT', label: '港口' },
  { value: 'HIGHWAY', label: '公路' },
  { value: 'ROAD', label: '道路' },
  
  // 服务设施
  { value: 'HOTEL', label: '酒店' },
  { value: 'RESTAURANT', label: '餐厅' },
  { value: 'SHOP', label: '商店' },
  { value: 'HOSPITAL', label: '医院' },
  { value: 'SCHOOL', label: '学校' },
  { value: 'BANK', label: '银行' },
  
  // 户外活动
  { value: 'CAMPING', label: '露营地' },
  { value: 'HIKING', label: '徒步路线' },
  { value: 'CYCLING', label: '骑行路线' },
  { value: 'CLIMBING', label: '攀岩' },
  { value: 'FISHING', label: '钓鱼' },
  
  // 观景点
  { value: 'VIEWPOINT', label: '观景台' },
  { value: 'SUNRISE', label: '日出点' },
  { value: 'SUNSET', label: '日落点' },
  { value: 'STARGAZING', label: '观星点' },
  
  // 补给点
  { value: 'SUPPLY', label: '补给点' },
  { value: 'WATER', label: '水源' },
  { value: 'FUEL', label: '加油站' },
  { value: 'REPAIR', label: '维修点' },
  
  // 其他
  { value: 'LANDMARK', label: '地标' },
  { value: 'HISTORIC', label: '历史遗迹' },
  { value: 'CULTURAL', label: '文化场所' },
  { value: 'ENTERTAINMENT', label: '娱乐场所' },
  { value: 'OTHER', label: '其他' },
];

export default function MapPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showRoutes, setShowRoutes] = useState(true);
  const [enablePOILoading, setEnablePOILoading] = useState(true); // 默认开启POI加载
  const [enableRouteLoading, setEnableRouteLoading] = useState(true);
  const [selectedPOITypes, setSelectedPOITypes] = useState<string[]>([]); // 默认显示所有POI类型
  const [selectedTravelModes, setSelectedTravelModes] = useState<TravelMode[]>([]); // 默认显示所有出行方式
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const filteredMarkers = selectedType === 'all' 
    ? sampleMarkers 
    : sampleMarkers.filter(marker => marker.name.includes(selectedType));

  // 处理POI类型筛选
  const handlePOITypeChange = (type: string) => {
    setSelectedPOITypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // 处理出行方式筛选
  const handleTravelModeChange = (mode: TravelMode) => {
    setSelectedTravelModes(prev => {
      if (prev.includes(mode)) {
        return prev.filter(m => m !== mode);
      } else {
        return [...prev, mode];
      }
    });
  };

  // 移除displayedRoutes，直接让Map组件从后端加载数据

  // 处理路线点击
  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    console.log('选择路线:', route);
  };

  // 出行方式选项
  const travelModeOptions = [
    { value: TravelMode.WALKING, label: '徒步', color: '#2ECC71' },
    { value: TravelMode.CYCLING, label: '骑行', color: '#3498DB' },
    { value: TravelMode.MOTORCYCLE, label: '摩托车', color: '#9B59B6' },
    { value: TravelMode.DRIVING, label: '自驾', color: '#E74C3C' },
    { value: TravelMode.RV, label: '房车', color: '#F39C12' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">地图浏览</h1>
      
      {/* 控制面板 */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-lg shadow-md p-6">
          {/* 路线控制 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">路线设置</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableRouteLoading"
                  checked={enableRouteLoading}
                  onChange={(e) => setEnableRouteLoading(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableRouteLoading" className="text-sm font-medium text-gray-700">
                  从后端加载路线数据
                </label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">出行方式:</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTravelModes(travelModeOptions.map(t => t.value))}
                      disabled={!enableRouteLoading}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTravelModes([])}
                      disabled={!enableRouteLoading}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {travelModeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`travel-mode-${option.value}`}
                        checked={selectedTravelModes.includes(option.value)}
                        onChange={() => handleTravelModeChange(option.value)}
                        disabled={!enableRouteLoading}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label 
                        htmlFor={`travel-mode-${option.value}`} 
                        className={`text-sm font-medium ${enableRouteLoading ? 'text-gray-700' : 'text-gray-400'}`}
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        ></span>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* POI控制 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">POI设置</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enablePOILoading"
                  checked={enablePOILoading}
                  onChange={(e) => setEnablePOILoading(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enablePOILoading" className="text-sm font-medium text-gray-700">
                  从后端加载POI数据
                </label>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">POI类型:</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPOITypes(POI_TYPES.map(t => t.value))}
                      disabled={!enablePOILoading}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPOITypes([])}
                      disabled={!enablePOILoading}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {POI_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`poi-type-${type.value}`}
                        checked={selectedPOITypes.includes(type.value)}
                        onChange={() => handlePOITypeChange(type.value)}
                        disabled={!enablePOILoading}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label 
                        htmlFor={`poi-type-${type.value}`} 
                        className={`text-xs ${enablePOILoading ? 'text-gray-700' : 'text-gray-400'}`}
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedPOITypes.length > 0 && (
                <div className="text-xs text-gray-500">
                  已选择: {selectedPOITypes.length} 个类型
                </div>
              )}
            </div>
          </div>

          {/* 传统标记控制 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">传统标记</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="type-all"
                  name="markerType"
                  value="all"
                  checked={selectedType === 'all'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="type-all" className="text-sm font-medium text-gray-700">
                  显示所有标记
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="type-palace"
                  name="markerType"
                  value="宫"
                  checked={selectedType === '宫'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="type-palace" className="text-sm font-medium text-gray-700">
                  宫殿建筑
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="type-park"
                  name="markerType"
                  value="公园"
                  checked={selectedType === '公园'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="type-park" className="text-sm font-medium text-gray-700">
                  公园景点
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="type-wall"
                  name="markerType"
                  value="城"
                  checked={selectedType === '城'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="type-wall" className="text-sm font-medium text-gray-700">
                  城墙古迹
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Map
          markers={filteredMarkers}
          enablePOILoading={enablePOILoading}
          enableRouteLoading={enableRouteLoading}
          selectedPOITypes={selectedPOITypes}
          selectedTravelModes={selectedTravelModes}
          onRouteClick={handleRouteClick}
        />
      </div>

      {/* 路线详情面板 */}
      {selectedRoute && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">路线详情</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">基本信息</h4>
              <p><strong>名称:</strong> {selectedRoute.name}</p>
              <p><strong>描述:</strong> {selectedRoute.description}</p>
              <p><strong>出行方式:</strong> {selectedRoute.travelMode}</p>
              <p><strong>难度:</strong> {selectedRoute.difficulty}/5</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">路线数据</h4>
              <p><strong>距离:</strong> {selectedRoute.distance} 公里</p>
              <p><strong>预计时长:</strong> {Math.floor(selectedRoute.estimatedDuration / 60)} 小时 {selectedRoute.estimatedDuration % 60} 分钟</p>
              <p><strong>路径点:</strong> {selectedRoute.pathPoints.length} 个</p>
            </div>
          </div>
        </div>
      )}

      {/* AI推荐 */}
      {showAIRecommendation && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">AI路线推荐</h3>
          <p className="text-gray-600">AI功能开发中...</p>
        </div>
      )}
    </div>
  );
}