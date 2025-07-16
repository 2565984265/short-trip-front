'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复Leaflet默认图标路径问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// API基础URL
const API_BASE_URL = 'http://localhost:8080/api';

// POI类型接口
interface POI {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  type: string;
  address?: string;
  description?: string;
  openingHours?: string;
  contactPhone?: string;
}

// API响应接口
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    name: string;
    description?: string;
    type?: 'scenic' | 'supply' | 'camping';
  }>;
  routes?: Array<{
    coordinates: [number, number][];
    color?: string;
    name?: string;
  }>;
  enablePOILoading?: boolean;
  enableRouteLoading?: boolean;
  selectedPOITypes?: string[];
  selectedTravelModes?: any[];
  onRouteClick?: (route: any) => void;
  resetView?: boolean; // 新增：用于重置地图视图
  onLocationUpdate?: (location: { lat: number; lng: number }) => void; // 新增：位置更新回调
}

export default function MapComponent({ 
  center = [39.9042, 116.4074],
  zoom = 10,
  markers = [],
  routes = [],
  enablePOILoading = false,
  enableRouteLoading = false,
  selectedPOITypes = [],
  selectedTravelModes = [],
  onRouteClick,
  resetView = false,
  onLocationUpdate
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pendingLocationMove, setPendingLocationMove] = useState<{ lat: number; lng: number } | null>(null);
  
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Polyline[]>([]);
  const lastRequestRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);
  const locationMarkerRef = useRef<L.Marker | null>(null);

  // 清理POI标记
  const clearPOIMarkers = useCallback(() => {
    poiMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(marker);
        } catch (e) {
          // 忽略清理时的错误
        }
      }
    });
    poiMarkersRef.current = [];
  }, []);

  // 清理路线标记
  const clearRouteLines = useCallback(() => {
    routeLinesRef.current.forEach(line => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(line);
        } catch (e) {
          // 忽略清理时的错误
        }
      }
    });
    routeLinesRef.current = [];
  }, []);

  // 获取POI数据的函数
  const fetchPOIs = useCallback(async (bounds: L.LatLngBounds) => {
    if (!enablePOILoading || !isComponentMountedRef.current) return;

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    const params = new URLSearchParams({
      minLng: sw.lng.toString(),
      minLat: sw.lat.toString(),
      maxLng: ne.lng.toString(),
      maxLat: ne.lat.toString(),
    });

    if (selectedPOITypes.length > 0) {
      selectedPOITypes.forEach(type => {
        params.append('types', type);
      });
    }

    const requestKey = params.toString();
    
    // 如果和上次请求相同，则跳过
    if (requestKey === lastRequestRef.current) {
      return;
    }

    lastRequestRef.current = requestKey;
    
    if (!isComponentMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(`${API_BASE_URL}/gsi/pois/area?${params}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<POI[]> = await response.json();
      
      if (result.code === 0 && isComponentMountedRef.current) {
        setPois(result.data);
      } else if (result.code !== 0) {
        throw new Error(result.message || '获取POI数据失败');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (isComponentMountedRef.current) {
        console.error('获取POI数据失败:', err);
        setError(err instanceof Error ? err.message : '获取POI数据失败');
      }
    } finally {
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enablePOILoading, selectedPOITypes]);

  // 获取路线数据的函数
  const fetchRoutes = useCallback(async (bounds: L.LatLngBounds) => {
    if (!enableRouteLoading || !isComponentMountedRef.current) return;

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    const params = new URLSearchParams({
      minLng: sw.lng.toString(),
      minLat: sw.lat.toString(),
      maxLng: ne.lng.toString(),
      maxLat: ne.lat.toString(),
    });

    if (selectedTravelModes.length > 0) {
      selectedTravelModes.forEach(mode => {
        params.append('travelModes', mode);
      });
    }

    const requestKey = params.toString();
    
    if (requestKey === lastRequestRef.current) {
      return;
    }

    lastRequestRef.current = requestKey;
    
    if (!isComponentMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(`${API_BASE_URL}/gsi/routes/area?${params}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any[]> = await response.json();
      
      if (result.code === 0 && isComponentMountedRef.current) {
        setRouteData(result.data);
      } else if (result.code !== 0) {
        throw new Error(result.message || '获取路线数据失败');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (isComponentMountedRef.current) {
        console.error('获取路线数据失败:', err);
        setError(err instanceof Error ? err.message : '获取路线数据失败');
      }
    } finally {
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enableRouteLoading, selectedTravelModes]);

  // 强制移动地图到指定位置
  const forceMoveToLocation = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    
    console.log('强制移动地图到:', [lat, lng]);
    
    // 方法1: 使用 flyTo
    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
    
    // 方法2: 如果 flyTo 不工作，使用 setView
    setTimeout(() => {
      if (mapInstanceRef.current) {
        const currentCenter = mapInstanceRef.current.getCenter();
        const distance = Math.sqrt(
          Math.pow(currentCenter.lat - lat, 2) + Math.pow(currentCenter.lng - lng, 2)
        );
        
        if (distance > 0.001) { // 如果距离还很远，强制设置
          console.log('flyTo 可能失败，使用 setView 强制设置');
          mapInstanceRef.current.setView([lat, lng], 15, { animate: false });
          mapInstanceRef.current.invalidateSize();
        }
      }
    }, 2000);
  }, []);

  // 获取当前位置
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('浏览器不支持地理定位');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        setCurrentLocation(location);
        setLocationLoading(false);
        
        // 通知父组件位置更新
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
        
        // 如果地图已准备好，移动到当前位置
        if (mapInstanceRef.current && mapReady) {
          console.log('开始移动地图到:', [latitude, longitude]);
          console.log('移动前地图中心:', mapInstanceRef.current.getCenter());
          
          // 先重置用户交互状态
          setUserInteracted(false);
          
          // 使用强制移动方法
          forceMoveToLocation(latitude, longitude);
          
          console.log('地图移动命令已执行');
        } else {
          // 如果地图还没准备好，保存待移动的位置
          setPendingLocationMove({ lat: latitude, lng: longitude });
          console.log('地图未准备好，保存待移动位置:', { lat: latitude, lng: longitude });
        }
        
        console.log('获取到当前位置:', location);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = '获取位置失败';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了位置请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
          default:
            errorMessage = '获取位置时发生未知错误';
        }
        
        setLocationError(errorMessage);
        console.error('获取位置失败:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [mapReady, onLocationUpdate]);

  // 防抖函数
  const debounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  // 防抖的POI获取函数
  const debouncedFetchPOIs = useCallback(
    debounce((bounds: L.LatLngBounds) => {
      fetchPOIs(bounds);
    }, 500),
    [fetchPOIs, debounce]
  );

  // 防抖的路线获取函数
  const debouncedFetchRoutes = useCallback(
    debounce((bounds: L.LatLngBounds) => {
      fetchRoutes(bounds);
    }, 500),
    [fetchRoutes, debounce]
  );

  // 初始化地图 - 使用更简单的方法
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Creating map instance...');
    
    // 创建地图实例
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true
    });
    
    mapInstanceRef.current = map;

    // 添加地图瓦片图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19
    }).addTo(map);

    // 设置地图准备状态
    map.whenReady(() => {
      console.log('Map is ready');
      setMapReady(true);
    });

    // 添加地图事件监听器
    const handleMapMove = () => {
      if (!map || !enablePOILoading) return;
      const bounds = map.getBounds();
      debouncedFetchPOIs(bounds);
    };

    const handleMapMoveForRoutes = () => {
      if (!map || !enableRouteLoading) return;
      const bounds = map.getBounds();
      debouncedFetchRoutes(bounds);
    };

    // 用户交互事件处理
    const handleUserInteraction = () => {
      setUserInteracted(true);
    };

    // 添加事件监听器
    if (enablePOILoading) {
      map.on('moveend', handleMapMove);
      map.on('zoomend', handleMapMove);
    }

    if (enableRouteLoading) {
      map.on('moveend', handleMapMoveForRoutes);
      map.on('zoomend', handleMapMoveForRoutes);
    }

    // 监听用户交互事件
    map.on('zoomstart', handleUserInteraction);
    map.on('movestart', handleUserInteraction);
    map.on('dragstart', handleUserInteraction);
    
    // 监听地图移动完成事件
    map.on('moveend', () => {
      console.log('地图移动完成，当前中心:', map.getCenter());
    });

    // 初始加载
    if (enablePOILoading) {
      const bounds = map.getBounds();
      fetchPOIs(bounds);
    }

    if (enableRouteLoading) {
      const bounds = map.getBounds();
      fetchRoutes(bounds);
    }

    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // 只在组件挂载时执行一次

  // 更新地图中心点和缩放级别 - 只在初始化时设置，避免覆盖用户操作
  useEffect(() => {
    if (mapInstanceRef.current && mapReady) {
      if (resetView) {
        // 如果设置了重置视图，强制更新并重置用户交互状态
        mapInstanceRef.current.setView(center, zoom);
        setUserInteracted(false);
      } else if (!userInteracted) {
        // 只在组件初始化且用户未交互时设置视图
        const currentCenter = mapInstanceRef.current.getCenter();
        const currentZoom = mapInstanceRef.current.getZoom();
        
        // 只有当当前视图与目标视图差异较大时才更新
        const centerDiff = Math.abs(currentCenter.lat - center[0]) + Math.abs(currentCenter.lng - center[1]);
        const zoomDiff = Math.abs(currentZoom - zoom);
        
        if (centerDiff > 0.01 || zoomDiff > 1) {
          mapInstanceRef.current.setView(center, zoom);
        }
      }
    }
  }, [center, zoom, mapReady, userInteracted, resetView]);

  // 更新POI标记
  useEffect(() => {
    if (!mapInstanceRef.current || !enablePOILoading || !mapReady) return;

    // 清理现有标记
    clearPOIMarkers();

    // 限制显示的POI数量
    const MAX_POIS_DISPLAY = 100;
    const poisToShow = pois.slice(0, MAX_POIS_DISPLAY);

    // 添加新标记
    poisToShow.forEach(poi => {
      const marker = L.marker([poi.latitude, poi.longitude])
        .bindPopup(`
          <div class="poi-popup">
            <h3 class="font-bold text-lg">${poi.name}</h3>
            <p class="text-sm text-gray-600">${poi.type}</p>
            ${poi.description ? `<p class="text-sm mt-2">${poi.description}</p>` : ''}
            ${poi.address ? `<p class="text-xs text-gray-500 mt-1">📍 ${poi.address}</p>` : ''}
          </div>
        `);

      marker.addTo(mapInstanceRef.current!);
      poiMarkersRef.current.push(marker);
    });
  }, [pois, enablePOILoading, mapReady, clearPOIMarkers]);

  // 更新路线
  useEffect(() => {
    if (!mapInstanceRef.current || !enableRouteLoading || !mapReady) return;

    // 清理现有路线
    clearRouteLines();

    // 限制显示的路线数量
    const MAX_ROUTES_DISPLAY = 20;
    const routesToShow = routeData.slice(0, MAX_ROUTES_DISPLAY);

    // 添加新路线
    routesToShow.forEach((route, index) => {
      // 从pathPoints中提取坐标数据
      let coordinates: [number, number][] = [];
      
      if (route.coordinates && route.coordinates.length > 0) {
        coordinates = route.coordinates;
      } else if (route.pathPoints && route.pathPoints.length > 0) {
        coordinates = route.pathPoints.map((point: any) => [point.latitude, point.longitude]);
      }
      
      if (coordinates.length > 0) {
        const polyline = L.polyline(coordinates, {
          color: route.color || '#3B82F6',
          weight: route.strokeWidth || 4,
          opacity: route.opacity || 0.8
        }).bindPopup(`
          <div class="route-popup">
            <h3 class="font-bold text-lg">${route.name || `路线 ${index + 1}`}</h3>
            <p class="text-sm text-gray-600">距离: ${route.distance ? `${route.distance}km` : '未知'}</p>
            <p class="text-sm text-gray-600">时间: ${route.estimatedDuration ? `${route.estimatedDuration}分钟` : '未知'}</p>
            <p class="text-sm text-gray-600">出行方式: ${route.travelMode || '未知'}</p>
          </div>
        `);

        polyline.addTo(mapInstanceRef.current!);
        routeLinesRef.current.push(polyline);

        // 添加点击事件
        if (onRouteClick) {
          polyline.on('click', () => {
            onRouteClick(route);
          });
        }
      }
    });
  }, [routeData, enableRouteLoading, mapReady, clearRouteLines, onRouteClick]);

  // 添加静态标记
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    // 清理之前的静态标记
    const staticMarkers = document.querySelectorAll('.static-marker');
    staticMarkers.forEach(marker => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(marker as any);
        } catch (e) {
          // 忽略清理时的错误
        }
      }
    });

    // 添加新的静态标记
    markers.forEach(marker => {
      const leafletMarker = L.marker(marker.position)
        .bindPopup(`
          <div class="static-marker-popup">
            <h3 class="font-bold text-lg">${marker.name}</h3>
            ${marker.description ? `<p class="text-sm mt-2">${marker.description}</p>` : ''}
            ${marker.type ? `<p class="text-xs text-gray-500 mt-1">类型: ${marker.type}</p>` : ''}
          </div>
        `)
        .addTo(mapInstanceRef.current!);

      // 添加CSS类用于标识
      (leafletMarker as any)._icon?.classList.add('static-marker');
    });
  }, [markers, mapReady]);

  // 添加静态路线
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    // 清理之前的静态路线
    const staticRoutes = document.querySelectorAll('.static-route');
    staticRoutes.forEach(route => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(route as any);
        } catch (e) {
          // 忽略清理时的错误
        }
      }
    });

    // 添加新的静态路线
    routes.forEach(route => {
      if (route.coordinates && route.coordinates.length > 0) {
        const polyline = L.polyline(route.coordinates, {
          color: route.color || '#EF4444',
          weight: 6,
          opacity: 0.9
        }).bindPopup(`
          <div class="static-route-popup">
            <h3 class="font-bold text-lg">${route.name || '自定义路线'}</h3>
          </div>
        `)
        .addTo(mapInstanceRef.current!);

        // 添加CSS类用于标识
        (polyline as any)._path?.classList.add('static-route');
      }
    });
  }, [routes, mapReady]);

  // 更新当前位置标记
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || !currentLocation) return;

    // 清理之前的定位标记
    if (locationMarkerRef.current) {
      mapInstanceRef.current.removeLayer(locationMarkerRef.current);
    }

    // 创建定位标记图标
    const locationIcon = L.divIcon({
      className: 'location-marker',
      html: `
        <div class="relative">
          <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg absolute top-0 left-0 animate-ping opacity-75"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // 添加定位标记
    const marker = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: locationIcon,
      zIndexOffset: 1000
    }).bindPopup(`
      <div class="location-popup">
        <h3 class="font-bold text-lg">当前位置</h3>
        <p class="text-sm text-gray-600">纬度: ${currentLocation.lat.toFixed(6)}</p>
        <p class="text-sm text-gray-600">经度: ${currentLocation.lng.toFixed(6)}</p>
      </div>
    `);

    marker.addTo(mapInstanceRef.current);
    locationMarkerRef.current = marker;
  }, [currentLocation, mapReady]);

  // 处理待移动的位置
  useEffect(() => {
    if (pendingLocationMove && mapInstanceRef.current && mapReady) {
      console.log('处理待移动位置:', pendingLocationMove);
      console.log('移动前地图中心:', mapInstanceRef.current.getCenter());
      
      // 先重置用户交互状态
      setUserInteracted(false);
      
      // 使用强制移动方法
      forceMoveToLocation(pendingLocationMove.lat, pendingLocationMove.lng);
      
      setPendingLocationMove(null);
    }
  }, [pendingLocationMove, mapReady, forceMoveToLocation]);

  // 处理设置变化
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    // 重新加载数据
    if (enablePOILoading) {
      const bounds = mapInstanceRef.current.getBounds();
      fetchPOIs(bounds);
    }

    if (enableRouteLoading) {
      const bounds = mapInstanceRef.current.getBounds();
      fetchRoutes(bounds);
    }
  }, [enablePOILoading, enableRouteLoading, selectedPOITypes, selectedTravelModes, mapReady, fetchPOIs, fetchRoutes]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ 
          minHeight: '400px',
          position: 'relative',
          zIndex: 1
        }}
      />
      
      {/* 定位按钮 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={getCurrentLocation}
          disabled={locationLoading}
          className="bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 hover:text-gray-900 disabled:text-gray-400 p-3 rounded-lg shadow-md border border-gray-200 transition-colors duration-200"
          title="获取当前位置"
        >
          {locationLoading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
        
        {/* 调试按钮 - 仅在开发模式下显示 */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                const currentCenter = mapInstanceRef.current.getCenter();
                console.log('当前地图中心:', currentCenter);
                console.log('地图实例状态:', {
                  mapReady,
                  userInteracted,
                  pendingLocationMove,
                  currentLocation
                });
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg shadow-md text-xs"
            title="调试地图状态"
          >
            调试
          </button>
        )}
      </div>
      
      {/* 加载指示器 */}
      {loading && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">加载中...</span>
          </div>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm">⚠️ {error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* 位置错误提示 */}
      {locationError && (
        <div className="absolute top-16 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm">📍 {locationError}</span>
            <button 
              onClick={() => setLocationError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* 数据统计 */}
      {(pois.length > 0 || routeData.length > 0 || currentLocation) && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md">
          <div className="text-xs text-gray-600">
            {pois.length > 0 && <div>POI: {pois.length}个</div>}
            {routeData.length > 0 && <div>路线: {routeData.length}条</div>}
            {enableRouteLoading && <div>路线加载: 已启用</div>}
            {!enableRouteLoading && <div>路线加载: 已禁用</div>}
            {currentLocation && (
              <div className="mt-1 pt-1 border-t border-gray-300">
                <div className="text-blue-600 font-medium">📍 当前位置</div>
                <div>纬度: {currentLocation.lat.toFixed(4)}</div>
                <div>经度: {currentLocation.lng.toFixed(4)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 