'use client';

import React, { useState, useEffect } from 'react';
import { kmlAPI } from '@/services/kml';
import dynamic from 'next/dynamic';

// KML路线类型定义
interface KMLRoute {
  id: number;
  name?: string;
  description?: string;
  travelMode?: string;
  creatorName?: string;
  tags?: string[];
  totalDistance?: number;
  trackPoints?: Array<{ latitude: number; longitude: number; altitude?: number }>;
  placemarks?: Array<{ name?: string; description?: string; coordinates: { latitude: number; longitude: number; altitude?: number } }>;
  maxAltitude?: number;
  minAltitude?: number;
  totalAscent?: number;
  totalDescent?: number;
  startPoint?: { latitude: number; longitude: number; altitude?: number };
  endPoint?: { latitude: number; longitude: number; altitude?: number };
}

// 使用dynamic import加载原有的Map组件，禁用SSR
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">正在加载地图...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  const [selectedKMLRoute, setSelectedKMLRoute] = useState<KMLRoute | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);



  // 处理KML路线点击
  const handleKMLRouteClick = (route: KMLRoute) => {
    setSelectedKMLRoute(route);
    console.log('选择KML路线:', route);
  };

  // 处理位置更新
  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    console.log('位置已更新:', location);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">KML路线地图</h1>
      
      {/* 地图容器 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-[600px] w-full">
          <Map
            center={[30.2741, 120.1551]}  // 杭州市中心坐标
            zoom={11}
            markers={[]}
            enablePOILoading={false}
            enableRouteLoading={false}
            enableKMLLoading={true}
            selectedPOITypes={[]}
            selectedTravelModes={[]}
            onKMLRouteClick={handleKMLRouteClick}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
      </div>

      {/* KML路线详情面板 */}
      {selectedKMLRoute && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">📍 KML路线详情</h3>
              <button
                onClick={() => setSelectedKMLRoute(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 基本信息 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 border-b pb-2">📋 基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-gray-600">名称:</span> {selectedKMLRoute.name || '未命名路线'}</div>
                  <div><span className="font-medium text-gray-600">描述:</span> {selectedKMLRoute.description || '无描述'}</div>
                  <div><span className="font-medium text-gray-600">出行方式:</span> 
                    <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getTravelModeText(selectedKMLRoute.travelMode)}
                    </span>
                  </div>
                  <div><span className="font-medium text-gray-600">创建者:</span> {selectedKMLRoute.creatorName || '未知'}</div>
                  {selectedKMLRoute.tags && selectedKMLRoute.tags.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">标签:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedKMLRoute.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 路线数据 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 border-b pb-2">📏 路线数据</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-gray-600">总距离:</span> 
                    <span className="ml-1 text-green-600 font-semibold">
                      {selectedKMLRoute.totalDistance ? `${(selectedKMLRoute.totalDistance / 1000).toFixed(2)} km` : '未知'}
                    </span>
                  </div>
                  <div><span className="font-medium text-gray-600">轨迹点数:</span> 
                    <span className="ml-1 text-blue-600 font-semibold">{selectedKMLRoute.trackPoints?.length || 0} 个</span>
                  </div>
                  <div><span className="font-medium text-gray-600">标注点数:</span> 
                    <span className="ml-1 text-purple-600 font-semibold">{selectedKMLRoute.placemarks?.length || 0} 个</span>
                  </div>
                  {selectedKMLRoute.maxAltitude && selectedKMLRoute.minAltitude && (
                    <div><span className="font-medium text-gray-600">海拔范围:</span> 
                      <span className="ml-1 text-orange-600 font-semibold">
                        {selectedKMLRoute.minAltitude.toFixed(0)}m - {selectedKMLRoute.maxAltitude.toFixed(0)}m
                      </span>
                    </div>
                  )}
                  {selectedKMLRoute.totalAscent && (
                    <div><span className="font-medium text-gray-600">总爬升:</span> 
                      <span className="ml-1 text-red-600 font-semibold">{selectedKMLRoute.totalAscent.toFixed(0)}m</span>
                    </div>
                  )}
                  {selectedKMLRoute.totalDescent && (
                    <div><span className="font-medium text-gray-600">总下降:</span> 
                      <span className="ml-1 text-blue-600 font-semibold">{selectedKMLRoute.totalDescent.toFixed(0)}m</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 起终点信息 */}
              {(selectedKMLRoute.startPoint || selectedKMLRoute.endPoint) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">🎯 起终点信息</h4>
                  <div className="space-y-3">
                    {selectedKMLRoute.startPoint && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-700 mb-2">🚩 起点</h5>
                        <div className="text-sm space-y-1">
                          <div>纬度: <span className="font-mono text-green-600">{selectedKMLRoute.startPoint.latitude.toFixed(6)}</span></div>
                          <div>经度: <span className="font-mono text-green-600">{selectedKMLRoute.startPoint.longitude.toFixed(6)}</span></div>
                          {selectedKMLRoute.startPoint.altitude && (
                            <div>海拔: <span className="font-mono text-green-600">{selectedKMLRoute.startPoint.altitude.toFixed(0)}m</span></div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedKMLRoute.endPoint && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-medium text-red-700 mb-2">🏁 终点</h5>
                        <div className="text-sm space-y-1">
                          <div>纬度: <span className="font-mono text-red-600">{selectedKMLRoute.endPoint.latitude.toFixed(6)}</span></div>
                          <div>经度: <span className="font-mono text-red-600">{selectedKMLRoute.endPoint.longitude.toFixed(6)}</span></div>
                          {selectedKMLRoute.endPoint.altitude && (
                            <div>海拔: <span className="font-mono text-red-600">{selectedKMLRoute.endPoint.altitude.toFixed(0)}m</span></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 获取出行方式文本
function getTravelModeText(mode: string | undefined): string {
  const modes: { [key: string]: string } = {
    'HIKING': '徒步',
    'CYCLING': '骑行',
    'DRIVING': '驾车',  
    'MOTORCYCLING': '摩托车',
    'WALKING': '步行'
  };
  return modes[mode || ''] || (mode || '未知');
}