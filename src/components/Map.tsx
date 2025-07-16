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
  type: string; // 支持所有GSIType类型
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

interface MapProps {
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
}

export default function Map({ 
  center = [39.9042, 116.4074],
  zoom = 10,
  markers = [],
  routes = [],
  enablePOILoading = false,
  enableRouteLoading = false,
  selectedPOITypes = [],
  selectedTravelModes = [],
  onRouteClick
}: MapProps) {
  console.log('Map component render', { enablePOILoading, selectedPOITypes });
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Polyline[]>([]);
  const lastRequestRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);
  const mapInitializedRef = useRef(false);

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

    console.log('fetchPOIs called', { enablePOILoading, bounds });

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
      console.log('Request skipped - same as last');
      return;
    }

    lastRequestRef.current = requestKey;
    
    // 检查组件是否仍然挂载
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

    console.log('fetchRoutes called', { enableRouteLoading, bounds });

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

    const requestKey = `routes_${params.toString()}`;
    
    // 如果和上次请求相同，则跳过
    if (requestKey === lastRequestRef.current) {
      console.log('Route request skipped - same as last');
      return;
    }

    lastRequestRef.current = requestKey;
    
    // 检查组件是否仍然挂载
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

  // 防抖的路线加载函数
  const debouncedFetchRoutes = useCallback((bounds: L.LatLngBounds) => {
    console.log('debouncedFetchRoutes called');
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!isComponentMountedRef.current || !enableRouteLoading) return;
      fetchRoutes(bounds);
    }, 1000);
  }, [fetchRoutes, enableRouteLoading]);

  // 防抖的POI加载函数
  const debouncedFetchPOIs = useCallback((bounds: L.LatLngBounds) => {
    console.log('debouncedFetchPOIs called');
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!isComponentMountedRef.current || !enablePOILoading) return;
      fetchPOIs(bounds);
    }, 1000);
  }, [fetchPOIs, enablePOILoading]);

  // 只在组件第一次挂载时初始化地图
  useEffect(() => {
    console.log('Map initialization useEffect', { 
      hasMapRef: !!mapRef.current, 
      isInitialized: mapInitializedRef.current 
    });
    
    if (!mapRef.current || mapInitializedRef.current) {
      console.log('Skipping map initialization');
      return;
    }

    console.log('Creating map instance');
    mapInitializedRef.current = true;

    // 创建地图实例
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      preferCanvas: true,
    });

    mapInstanceRef.current = map;

    // 添加瓦片层
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 1,
    });

    tileLayer.addTo(map);

    // 只有在启用POI加载时才添加事件监听器
    if (enablePOILoading) {
      console.log('Adding POI event listeners');
      
      const handleMapMove = () => {
        console.log('Map move event');
        
        if (!mapInstanceRef.current || !isComponentMountedRef.current) return;
        
        try {
          const bounds = mapInstanceRef.current.getBounds();
          debouncedFetchPOIs(bounds);
        } catch (e) {
          console.warn('获取地图边界失败:', e);
        }
      };

      map.on('moveend', handleMapMove);
      map.on('zoomend', handleMapMove);

      // 延迟初始加载
      setTimeout(() => {
        console.log('Initial POI load');
        if (mapInstanceRef.current && isComponentMountedRef.current) {
          try {
            const bounds = mapInstanceRef.current.getBounds();
            debouncedFetchPOIs(bounds);
          } catch (e) {
            console.warn('初始POI加载失败:', e);
          }
        }
      }, 500);
    }

    // 只有在启用路线加载时才添加事件监听器
    if (enableRouteLoading) {
      console.log('Adding Route event listeners');
      
      const handleMapMoveForRoutes = () => {
        console.log('Map move event for routes');
        
        if (!mapInstanceRef.current || !isComponentMountedRef.current) return;
        
        try {
          const bounds = mapInstanceRef.current.getBounds();
          debouncedFetchRoutes(bounds);
        } catch (e) {
          console.warn('获取地图边界失败:', e);
        }
      };

      map.on('moveend', handleMapMoveForRoutes);
      map.on('zoomend', handleMapMoveForRoutes);

      // 延迟初始加载
      setTimeout(() => {
        console.log('Initial Route load');
        if (mapInstanceRef.current && isComponentMountedRef.current) {
          try {
            const bounds = mapInstanceRef.current.getBounds();
            debouncedFetchRoutes(bounds);
          } catch (e) {
            console.warn('初始路线加载失败:', e);
          }
        }
      }, 500);
    }

    // 清理函数
    return () => {
      console.log('Map cleanup');
      
      isComponentMountedRef.current = false;
      mapInitializedRef.current = false;
      
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (e) {
        console.error('Map cleanup error:', e);
      }
    };
  }, []); // 空依赖数组确保只运行一次

  // 将POI转换为地图标记
  const convertPOIToMarker = useCallback((poi: POI) => {
    const position: [number, number] = [poi.latitude, poi.longitude];
    
    // 根据GSI类型设置图标颜色和标签
    let iconColor = '#3388ff';
    let typeLabel = '未知';
    
    switch (poi.type) {
      // 自然景观
      case 'MOUNTAIN':
        iconColor = '#8B4513';
        typeLabel = '山峰';
        break;
      case 'LAKE':
        iconColor = '#4169E1';
        typeLabel = '湖泊';
        break;
      case 'RIVER':
        iconColor = '#00CED1';
        typeLabel = '河流';
        break;
      case 'FOREST':
        iconColor = '#228B22';
        typeLabel = '森林';
        break;
      case 'BEACH':
        iconColor = '#F0E68C';
        typeLabel = '海滩';
        break;
      case 'WATERFALL':
        iconColor = '#00BFFF';
        typeLabel = '瀑布';
        break;
      case 'CAVE':
        iconColor = '#556B2F';
        typeLabel = '洞穴';
        break;
       
      // 人文景观
      case 'TEMPLE':
        iconColor = '#DAA520';
        typeLabel = '寺庙';
        break;
      case 'MUSEUM':
        iconColor = '#9932CC';
        typeLabel = '博物馆';
        break;
      case 'PARK':
        iconColor = '#32CD32';
        typeLabel = '公园';
        break;
      case 'SQUARE':
        iconColor = '#DC143C';
        typeLabel = '广场';
        break;
      case 'BRIDGE':
        iconColor = '#708090';
        typeLabel = '桥梁';
        break;
      case 'TOWER':
        iconColor = '#FF4500';
        typeLabel = '塔楼';
        break;
       
      // 交通设施
      case 'STATION':
        iconColor = '#4682B4';
        typeLabel = '车站';
        break;
      case 'AIRPORT':
        iconColor = '#6495ED';
        typeLabel = '机场';
        break;
      case 'PORT':
        iconColor = '#2F4F4F';
        typeLabel = '港口';
        break;
      case 'HIGHWAY':
      case 'ROAD':
        iconColor = '#A9A9A9';
        typeLabel = poi.type === 'HIGHWAY' ? '公路' : '道路';
        break;
       
      // 服务设施
      case 'HOTEL':
        iconColor = '#FF69B4';
        typeLabel = '酒店';
        break;
      case 'RESTAURANT':
        iconColor = '#FF6347';
        typeLabel = '餐厅';
        break;
      case 'SHOP':
        iconColor = '#FFD700';
        typeLabel = '商店';
        break;
      case 'HOSPITAL':
        iconColor = '#FF0000';
        typeLabel = '医院';
        break;
      case 'SCHOOL':
        iconColor = '#4169E1';
        typeLabel = '学校';
        break;
      case 'BANK':
        iconColor = '#008000';
        typeLabel = '银行';
        break;
       
      // 户外活动
      case 'CAMPING':
        iconColor = '#45b7d1';
        typeLabel = '露营地';
        break;
      case 'HIKING':
        iconColor = '#8FBC8F';
        typeLabel = '徒步路线';
        break;
      case 'CYCLING':
        iconColor = '#00FA9A';
        typeLabel = '骑行路线';
        break;
      case 'CLIMBING':
        iconColor = '#CD853F';
        typeLabel = '攀岩';
        break;
      case 'FISHING':
        iconColor = '#4682B4';
        typeLabel = '钓鱼';
        break;
       
      // 观景点
      case 'VIEWPOINT':
        iconColor = '#f39c12';
        typeLabel = '观景台';
        break;
      case 'SUNRISE':
        iconColor = '#FFA500';
        typeLabel = '日出点';
        break;
      case 'SUNSET':
        iconColor = '#FF8C00';
        typeLabel = '日落点';
        break;
      case 'STARGAZING':
        iconColor = '#191970';
        typeLabel = '观星点';
        break;
       
      // 补给点
      case 'SUPPLY':
        iconColor = '#4ecdc4';
        typeLabel = '补给点';
        break;
      case 'WATER':
        iconColor = '#87CEEB';
        typeLabel = '水源';
        break;
      case 'FUEL':
        iconColor = '#FF4500';
        typeLabel = '加油站';
        break;
      case 'REPAIR':
        iconColor = '#696969';
        typeLabel = '维修点';
        break;
       
      // 其他
      case 'LANDMARK':
        iconColor = '#FF4500';
        typeLabel = '地标';
        break;
      case 'HISTORIC':
        iconColor = '#B8860B';
        typeLabel = '历史遗迹';
        break;
      case 'CULTURAL':
        iconColor = '#9370DB';
        typeLabel = '文化场所';
        break;
      case 'ENTERTAINMENT':
        iconColor = '#FF1493';
        typeLabel = '娱乐场所';
        break;
      case 'OTHER':
      default:
        iconColor = '#74b9ff';
        typeLabel = '其他';
        break;
    }

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker(position).setIcon(customIcon);

    const popupContent = `
      <div style="min-width: 250px;">
        <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${poi.name}</h3>
        ${poi.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${poi.description}</p>` : ''}
        ${poi.address ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 12px;"><strong>地址:</strong> ${poi.address}</p>` : ''}
        ${poi.openingHours ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 12px;"><strong>开放时间:</strong> ${poi.openingHours}</p>` : ''}
        ${poi.contactPhone ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 12px;"><strong>电话:</strong> ${poi.contactPhone}</p>` : ''}
        <span style="display: inline-block; padding: 2px 8px; background: ${iconColor}; color: white; border-radius: 12px; font-size: 12px; margin-top: 8px;">${typeLabel}</span>
      </div>
    `;

    marker.bindPopup(popupContent);
    return marker;
  }, []);

  // 将路线转换为地图线条
  const convertRouteToPolyline = useCallback((route: any) => {
    if (!route.pathPoints || !Array.isArray(route.pathPoints)) {
      return null;
    }

    const coordinates = route.pathPoints.map((point: any) => [point.latitude, point.longitude] as [number, number]);
    
    const polyline = L.polyline(coordinates, {
      color: route.color || '#3388ff',
      weight: route.strokeWidth || 3,
      opacity: route.opacity || 0.8,
    });
    
    const popupContent = `
      <div style="max-width: 250px;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold;">${route.name}</h3>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${route.description || '暂无描述'}</p>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">出行方式: ${route.travelMode}</p>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">距离: ${route.distance || 0} 公里</p>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">预计时长: ${Math.floor((route.estimatedDuration || 0) / 60)} 小时 ${(route.estimatedDuration || 0) % 60} 分钟</p>
        <p style="margin: 0; font-size: 12px; color: #666;">难度: ${route.difficulty || 1}/5</p>
      </div>
    `;
    
    polyline.bindPopup(popupContent);

    // 添加点击事件
    polyline.on('click', () => {
      if (onRouteClick) {
        onRouteClick(route);
      }
    });

    return polyline;
  }, [onRouteClick]);

  // 在地图实例存在时添加静态标记
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    console.log('Updating static markers');
    
    const map = mapInstanceRef.current;

    // 清除之前的静态标记
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer as any)._isStaticMarker) {
        map.removeLayer(layer);
      }
    });

    // 添加新的静态标记点
    markers.forEach(({ position, name, description, type }) => {
      const marker = L.marker(position);
      (marker as any)._isStaticMarker = true;
      
      let iconColor = '#3388ff';
      if (type === 'scenic') iconColor = '#ff6b6b';
      if (type === 'supply') iconColor = '#4ecdc4';
      if (type === 'camping') iconColor = '#45b7d1';

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      marker.setIcon(customIcon);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${name}</h3>
          ${description ? `<p style="margin: 0; color: #666; font-size: 14px;">${description}</p>` : ''}
          ${type ? `<span style="display: inline-block; padding: 2px 8px; background: ${iconColor}; color: white; border-radius: 12px; font-size: 12px; margin-top: 8px;">${type}</span>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
      marker.addTo(map);
    });
  }, [markers, mapInstanceRef.current]);

  // 在地图实例存在时添加路线
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    console.log('Updating routes');
    
    const map = mapInstanceRef.current;

    // 清除之前的路线
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline && (layer as any)._isRoute) {
        map.removeLayer(layer);
      }
      if (layer instanceof L.Marker && (layer as any)._isRouteMarker) {
        map.removeLayer(layer);
      }
    });

    // 添加新的路线
    routes.forEach(({ coordinates, color = '#3388ff', name }) => {
      const polyline = L.polyline(coordinates, {
        color,
        weight: 4,
        opacity: 0.8,
      });
      (polyline as any)._isRoute = true;
      polyline.addTo(map);

      if (name) {
        const midPoint = coordinates[Math.floor(coordinates.length / 2)];
        const routeMarker = L.marker(midPoint);
        (routeMarker as any)._isRouteMarker = true;
        routeMarker.bindPopup(name);
        routeMarker.addTo(map);
      }
    });
  }, [routes, mapInstanceRef.current]);

  // 当POI数据更新时，重新渲染标记
  useEffect(() => {
    if (!mapInstanceRef.current || !enablePOILoading) return;

    console.log('Updating POI markers', { poisCount: pois.length });

    clearPOIMarkers();

    const newMarkers = pois.map((poi) => {
      const marker = convertPOIToMarker(poi);
      if (mapInstanceRef.current) {
        marker.addTo(mapInstanceRef.current);
      }
      return marker;
    });

    poiMarkersRef.current = newMarkers;
  }, [pois, enablePOILoading, convertPOIToMarker, clearPOIMarkers]);

  // 当路线数据更新时，重新渲染路线
  useEffect(() => {
    if (!mapInstanceRef.current || !enableRouteLoading || !isComponentMountedRef.current) return;

    console.log('Updating Route polylines', { routesCount: routeData.length });

    clearRouteLines();

    const newRoutes = routeData.map((route) => {
      const polyline = convertRouteToPolyline(route);
      if (polyline && mapInstanceRef.current) {
        polyline.addTo(mapInstanceRef.current);
        return polyline;
      }
      return null;
    }).filter(Boolean) as L.Polyline[];

    routeLinesRef.current = newRoutes;
  }, [routeData, enableRouteLoading, convertRouteToPolyline, clearRouteLines]);

  // 当selectedPOITypes变化时重新加载POI
  useEffect(() => {
    if (!mapInstanceRef.current || !enablePOILoading || !isComponentMountedRef.current) return;
    
    console.log('POI types changed, reloading', { selectedPOITypes });
    
    // 重置上次请求记录，强制重新加载
    lastRequestRef.current = '';
    
    try {
      const bounds = mapInstanceRef.current.getBounds();
      debouncedFetchPOIs(bounds);
    } catch (e) {
      console.warn('POI类型变化时重新加载失败:', e);
    }
  }, [selectedPOITypes, enablePOILoading, debouncedFetchPOIs]);

  // 当selectedTravelModes变化时重新加载路线
  useEffect(() => {
    if (!mapInstanceRef.current || !enableRouteLoading || !isComponentMountedRef.current) return;
    
    console.log('Travel modes changed, reloading routes', { selectedTravelModes });
    
    // 重置上次请求记录，强制重新加载
    lastRequestRef.current = '';
    
    try {
      const bounds = mapInstanceRef.current.getBounds();
      debouncedFetchRoutes(bounds);
    } catch (e) {
      console.warn('出行方式变化时重新加载路线失败:', e);
    }
  }, [selectedTravelModes, enableRouteLoading, debouncedFetchRoutes]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      console.log('Component unmounting');
      
      isComponentMountedRef.current = false;
      
      // 清理定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // 取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 清理POI标记
      clearPOIMarkers();
      
      // 清理路线标记
      clearRouteLines();
    };
  }, [clearPOIMarkers, clearRouteLines]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }} 
      />
      
      {loading && (
        <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">加载POI数据...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm">⚠️ {error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {pois.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
          <span className="text-sm text-gray-600">
            发现 {pois.length} 个兴趣点
            {enableRouteLoading && routeData.length > 0 && `, ${routeData.length} 条路线`}
          </span>
        </div>
      )}
    </div>
  );
} 