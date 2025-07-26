'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复Leaflet默认图标路径问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface KMLOnlineEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kmlData: any) => void;
}

interface RoutePoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  description?: string;
  type: 'waypoint' | 'marker';
}

export default function KMLOnlineEditor({ isOpen, onClose, onSave }: KMLOnlineEditorProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [currentPolyline, setCurrentPolyline] = useState<L.Polyline | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [travelMode, setTravelMode] = useState('HIKING');
  const [totalDistance, setTotalDistance] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  // 初始化地图
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // 创建地图
    const map = L.map(mapContainerRef.current).setView([39.9042, 116.4074], 10);
    
    // 添加瓦片图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  // 处理地图点击事件
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingMode) return;

      const { lat, lng } = e.latlng;
      const newPoint: RoutePoint = {
        id: Date.now().toString(),
        lat,
        lng,
        type: 'waypoint'
      };

      setRoutePoints(prev => [...prev, newPoint]);

      // 添加标记
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`点 ${routePoints.length + 1}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setMarkers(prev => [...prev, marker]);

      // 更新路线
      updatePolyline([...routePoints, newPoint]);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode, routePoints]);

  // 计算两点间距离（使用Haversine公式）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 更新多段线
  const updatePolyline = (points: RoutePoint[]) => {
    if (!mapRef.current) return;

    // 移除旧的多段线
    if (currentPolyline) {
      mapRef.current.removeLayer(currentPolyline);
    }

    // 如果有至少2个点，创建新的多段线
    if (points.length >= 2) {
      const latlngs = points.map(point => [point.lat, point.lng] as L.LatLngTuple);
      const polyline = L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8
      }).addTo(mapRef.current);
      
      setCurrentPolyline(polyline);

      // 计算总距离
      let distance = 0;
      for (let i = 1; i < points.length; i++) {
        distance += calculateDistance(
          points[i-1].lat, points[i-1].lng,
          points[i].lat, points[i].lng
        );
      }
      setTotalDistance(distance);
    } else {
      setTotalDistance(0);
    }
  };

  // 切换绘制模式
  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  // 清除路线
  const clearRoute = () => {
    if (!mapRef.current) return;

    // 移除所有标记
    markers.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    setMarkers([]);

    // 移除多段线
    if (currentPolyline) {
      mapRef.current.removeLayer(currentPolyline);
      setCurrentPolyline(null);
    }

    // 清除点数据
    setRoutePoints([]);
  };

  // 撤销最后一个点
  const undoLastPoint = () => {
    if (routePoints.length === 0) return;

    const newPoints = routePoints.slice(0, -1);
    setRoutePoints(newPoints);

    // 移除最后一个标记
    if (markers.length > 0) {
      const lastMarker = markers[markers.length - 1];
      if (mapRef.current) {
        mapRef.current.removeLayer(lastMarker);
      }
      setMarkers(prev => prev.slice(0, -1));
    }

    // 更新多段线
    updatePolyline(newPoints);
  };

  // 定位到当前位置
  const locateUser = () => {
    if (!mapRef.current) return;

    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
            
            // 添加当前位置标记
            const userMarker = L.marker([latitude, longitude], {
              icon: L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }).addTo(mapRef.current);
            
            userMarker.bindPopup('您的当前位置').openPopup();
            
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.removeLayer(userMarker);
              }
            }, 3000);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('定位失败:', error);
          alert('定位失败，请确保已允许访问位置信息');
          setIsLocating(false);
        }
      );
    } else {
      alert('您的浏览器不支持定位功能');
      setIsLocating(false);
    }
  };

  // 生成KML数据
  const generateKML = () => {
    if (routePoints.length < 2) {
      alert('至少需要两个点才能创建路线');
      return;
    }

    const coordinates = routePoints
      .map(point => `${point.lng},${point.lat},0`)
      .join(' ');

    // 当前时间
    const now = new Date().toISOString();
    
    // 路线统计信息
    const statsDescription = `
路线信息:
- 总点数: ${routePoints.length}
- 总距离: ${totalDistance.toFixed(2)} km
- 出行方式: ${getTravelModeText(travelMode)}
- 创建时间: ${new Date().toLocaleString('zh-CN')}

${routeDescription || ''}`.trim();

    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${routeName || '未命名路线'}</name>
    <description><![CDATA[${statsDescription}]]></description>
    <Style id="routeStyle">
      <LineStyle>
        <color>ff0080ff</color>
        <width>4</width>
      </LineStyle>
    </Style>
    <Style id="pointStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <Placemark>
      <name>${routeName || '未命名路线'}</name>
      <description><![CDATA[${statsDescription}]]></description>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${coordinates}</coordinates>
      </LineString>
    </Placemark>
    ${routePoints.map((point, index) => `
    <Placemark>
      <name>路点 ${index + 1}</name>
      <description><![CDATA[
        坐标: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}<br/>
        ${index === 0 ? '起点' : index === routePoints.length - 1 ? '终点' : `第${index + 1}个路点`}
      ]]></description>
      <styleUrl>#pointStyle</styleUrl>
      <Point>
        <coordinates>${point.lng},${point.lat},0</coordinates>
      </Point>
    </Placemark>
    `).join('')}
  </Document>
</kml>`;

    const kmlData = {
      routeName: routeName || '未命名路线',
      travelMode,
      remarks: statsDescription,
      isPublic: true,
      isRecommended: false,
      content: kmlContent,
      points: routePoints,
      distance: totalDistance
    };

    onSave(kmlData);
  };

  // 获取出行方式文本
  const getTravelModeText = (mode: string) => {
    const modes: { [key: string]: string } = {
      'HIKING': '徒步',
      'CYCLING': '骑行', 
      'DRIVING': '驾车',
      'MOTORCYCLING': '摩托车',
      'WALKING': '步行'
    };
    return modes[mode] || mode;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* 头部 */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">在线制作KML路线</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 主体内容 */}
          <div className="bg-gray-50 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 左侧控制面板 */}
              <div className="lg:col-span-1 space-y-4">
                {/* 路线信息 */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">路线信息</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        路线名称
                      </label>
                      <input
                        type="text"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="输入路线名称"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        出行方式
                      </label>
                      <select
                        value={travelMode}
                        onChange={(e) => setTravelMode(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="HIKING">徒步</option>
                        <option value="CYCLING">骑行</option>
                        <option value="DRIVING">驾车</option>
                        <option value="MOTORCYCLING">摩托车</option>
                        <option value="WALKING">步行</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        路线描述
                      </label>
                      <textarea
                        value={routeDescription}
                        onChange={(e) => setRouteDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="输入路线描述..."
                      />
                    </div>
                  </div>
                </div>

                {/* 绘制工具 */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">绘制工具</h4>
                  <div className="space-y-2">
                    <button
                      onClick={locateUser}
                      disabled={isLocating}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
                        isLocating
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isLocating ? '定位中...' : '📍 定位当前位置'}
                    </button>
                    <button
                      onClick={toggleDrawingMode}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
                        isDrawingMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isDrawingMode ? '🔴 结束绘制' : '✏️ 开始绘制'}
                    </button>
                    <button
                      onClick={undoLastPoint}
                      disabled={routePoints.length === 0}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↶ 撤销上一点
                    </button>
                    <button
                      onClick={clearRoute}
                      disabled={routePoints.length === 0}
                      className="w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🗑️ 清除路线
                    </button>
                  </div>
                </div>

                {/* 路线统计 */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">路线统计</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>路线点数：</span>
                      <span className="font-medium text-blue-600">{routePoints.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>路线距离：</span>
                      <span className="font-medium text-green-600">
                        {totalDistance > 0 ? `${totalDistance.toFixed(2)} km` : '0 km'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>绘制状态：</span>
                      <span className={`font-medium ${isDrawingMode ? 'text-green-600' : 'text-gray-500'}`}>
                        {isDrawingMode ? '🟢 绘制中' : '⚫ 未绘制'}
                      </span>
                    </div>
                    {routePoints.length >= 2 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md">
                        <div className="text-xs text-blue-600 mb-1">路线概要</div>
                        <div className="text-xs text-blue-800">
                          起点: {routePoints[0].lat.toFixed(4)}, {routePoints[0].lng.toFixed(4)}
                        </div>
                        <div className="text-xs text-blue-800">
                          终点: {routePoints[routePoints.length-1].lat.toFixed(4)}, {routePoints[routePoints.length-1].lng.toFixed(4)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧地图区域 */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {/* 地图状态栏 */}
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {isDrawingMode ? (
                            <span className="text-green-600 font-medium">
                              🖱️ 点击地图添加路线点
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              点击&quot;开始绘制&quot;按钮开始创建路线
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {routePoints.length > 0 && (
                          <span>
                            已添加 {routePoints.length} 个点
                            {totalDistance > 0 && ` | ${totalDistance.toFixed(2)} km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 地图容器 */}
                  <div className="h-96 lg:h-[600px] relative">
                    <div ref={mapContainerRef} className="w-full h-full"></div>
                    
                    {/* 绘制模式遮罩提示 */}
                    {isDrawingMode && routePoints.length === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center pointer-events-none">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                          <p className="text-sm font-medium text-gray-800">
                            点击地图开始绘制路线
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={generateKML}
              disabled={routePoints.length < 2}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              保存KML文件
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 