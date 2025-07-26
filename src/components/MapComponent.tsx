'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { kmlAPI } from '@/services/kml';
import { getFileContent } from '@/services/api';

// KML路线类型
interface KMLRoute {
  id: number;
  name?: string;
  description?: string;
  travelMode?: string;
  creatorName?: string;
  tags?: string[];
  totalDistance?: number;
  trackPoints: Array<{ latitude: number; longitude: number; altitude?: number }>;
  placemarks: Array<{ 
    name?: string; 
    description?: string; 
    coordinates: { latitude: number; longitude: number; altitude?: number };
    coordinate?: { latitude: number; longitude: number; altitude?: number }; // 兼容字段
    type?: string;
    attachments?: any[];
  }>;
  maxAltitude?: number;
  minAltitude?: number;
  totalAscent?: number;
  totalDescent?: number;
  startPoint?: { latitude: number; longitude: number; altitude?: number };
  endPoint?: { latitude: number; longitude: number; altitude?: number };
}

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
  enableKMLLoading?: boolean; // 新增：是否启用KML路线加载
  selectedPOITypes?: string[];
  selectedTravelModes?: any[];
  onRouteClick?: (route: any) => void;
  onKMLRouteClick?: (route: KMLRoute) => void; // 新增：KML路线点击回调
  resetView?: boolean; // 新增：用于重置地图视图
  onLocationUpdate?: (location: { lat: number; lng: number }) => void; // 新增：位置更新回调
}

export default function MapComponent({ 
  center = [30.2741, 120.1551], // 杭州市中心坐标
  zoom = 11,
  markers = [],
  routes = [],
  enablePOILoading = false,
  enableRouteLoading = false,
  enableKMLLoading = false,
  selectedPOITypes = [],
  selectedTravelModes = [],
  onRouteClick,
  onKMLRouteClick,
  resetView = false,
  onLocationUpdate
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [kmlRoutes, setKmlRoutes] = useState<KMLRoute[]>([]);
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
  const kmlRouteLinesRef = useRef<L.Polyline[]>([]);
  const kmlPlacemarkMarkersRef = useRef<L.Marker[]>([]);
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

  // 清理KML路线标记
  const clearKMLLines = useCallback(() => {
    kmlRouteLinesRef.current.forEach(line => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(line);
        } catch (e) {
          // 忽略清理时的错误
        }
      }
    });
    kmlRouteLinesRef.current = [];
  }, []);

  // 清理KML标注点标记
  const clearKMLPlacemarks = useCallback(() => {
    kmlPlacemarkMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(marker);
        } catch (e) {
          // 忽略清理时的错误
        }
      }
    });
    kmlPlacemarkMarkersRef.current = [];
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

  // 获取KML路线数据的函数
  const fetchKMLRoutes = useCallback(async () => {
    if (!enableKMLLoading || !isComponentMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🗺️ 开始加载KML路线数据...');
      
      // 使用正确的KML文件API端点
      const response = await kmlAPI.getPublicKMLFiles(0, 20) as any;
      console.log('📁 KML文件列表响应:', response);
      
      if (response.code !== 0) {
        throw new Error(response.message || 'KML数据加载失败');
      }
      
      const kmlFiles = response.data?.content || [];
      console.log(`📋 获取到 ${kmlFiles.length} 个KML文件`);
      
      if (kmlFiles.length === 0) {
        console.log('⚠️ 暂无KML路线数据');
        if (isComponentMountedRef.current) {
          setKmlRoutes([]);
        }
        return;
      }

      const routes: KMLRoute[] = [];
      let processedCount = 0;
      
      // 处理每个KML文件，限制数量避免性能问题
      for (const kmlFile of kmlFiles.slice(0, 10)) {
        try {
          console.log(`🔄 处理KML文件: ${kmlFile.fileName} (ID: ${kmlFile.id})`);
          
          // 创建基本路线对象
          const route: KMLRoute = {
            id: kmlFile.id,
            name: kmlFile.routeName || kmlFile.fileName || '未命名路线',
            description: kmlFile.routeDescription || kmlFile.remarks || '',
            travelMode: kmlFile.travelMode,
            creatorName: kmlFile.creatorName,
            totalDistance: kmlFile.totalDistance,
            trackPoints: [],
            placemarks: []
          };

          try {
            // 尝试下载并解析KML文件内容获取详细轨迹点
            console.log(`📄 下载KML文件内容: ${kmlFile.id}`);
            const kmlContent = await getFileContent(`/api/kml-files/${kmlFile.id}/download`);

            console.log(`📄 KML内容长度: ${kmlContent.length} 字符`);
            
            // 解析KML XML内容
            const parser = new DOMParser();
            const kmlDoc = parser.parseFromString(kmlContent, 'text/xml');
            
            // 检查解析错误
            const parseError = kmlDoc.querySelector('parsererror');
            if (parseError) {
              throw new Error('KML解析错误: ' + parseError.textContent);
            }
            
            // 首先尝试解析轨迹线 (LineString coordinates) - 在线编辑器生成的KML
            const lineStrings = kmlDoc.querySelectorAll('LineString coordinates');
            let hasLineString = false;
            
            lineStrings.forEach(coordsElement => {
              const coordsText = coordsElement.textContent?.trim();
              if (coordsText) {
                const coordinates = coordsText
                  .split(/\s+/)
                  .map(coord => coord.trim())
                  .filter(coord => coord.length > 0)
                  .map(coord => {
                    const [lng, lat, alt] = coord.split(',').map(Number);
                    return { latitude: lat, longitude: lng, altitude: alt || undefined };
                  })
                  .filter(point => !isNaN(point.latitude) && !isNaN(point.longitude));
                
                route.trackPoints.push(...coordinates);
                hasLineString = true;
              }
            });
            
            // 解析标注点 (Placemark)
            const placemarks = kmlDoc.querySelectorAll('Placemark');
            const placemarkPoints: Array<{latitude: number, longitude: number, altitude?: number, name?: string, description?: string}> = [];
            
            placemarks.forEach(placemark => {
              const pointCoords = placemark.querySelector('Point coordinates');
              if (pointCoords) {
                const coordsText = pointCoords.textContent?.trim();
                if (coordsText) {
                  const [lng, lat, alt] = coordsText.split(',').map(Number);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    const name = placemark.querySelector('name')?.textContent || '';
                    const description = placemark.querySelector('description')?.textContent || '';
                    
                    const point = {
                      latitude: lat,
                      longitude: lng, 
                      altitude: alt || undefined,
                      name,
                      description
                    };
                    
                    placemarkPoints.push(point);
                    
                    // 添加到标注点列表
                    route.placemarks.push({
                      name,
                      description,
                      coordinates: { latitude: lat, longitude: lng, altitude: alt || undefined },
                      coordinate: { latitude: lat, longitude: lng, altitude: alt || undefined } // 兼容字段
                    });
                  }
                }
              }
            });
            
            // 如果没有LineString轨迹线，但有多个标注点，则将标注点作为轨迹线连接
            if (!hasLineString && placemarkPoints.length > 1) {
              console.log(`📍 没有LineString，将 ${placemarkPoints.length} 个标注点连接为轨迹线`);
              
              // 智能排序：尝试按地理位置构建合理的路径
              const sortedPoints = [...placemarkPoints];
              
              // 如果点数不多（<=10），使用简单的最近邻排序
              if (sortedPoints.length <= 10) {
                const orderedPoints = [sortedPoints[0]]; // 从第一个点开始
                const remainingPoints = sortedPoints.slice(1);
                
                while (remainingPoints.length > 0) {
                  const lastPoint = orderedPoints[orderedPoints.length - 1];
                  let nearestIndex = 0;
                  let nearestDistance = Number.MAX_VALUE;
                  
                  // 找到距离当前最后一个点最近的点
                  remainingPoints.forEach((point, index) => {
                    const distance = Math.sqrt(
                      Math.pow(point.latitude - lastPoint.latitude, 2) + 
                      Math.pow(point.longitude - lastPoint.longitude, 2)
                    );
                    if (distance < nearestDistance) {
                      nearestDistance = distance;
                      nearestIndex = index;
                    }
                  });
                  
                  orderedPoints.push(remainingPoints[nearestIndex]);
                  remainingPoints.splice(nearestIndex, 1);
                }
                
                route.trackPoints = orderedPoints.map(p => ({
                  latitude: p.latitude,
                  longitude: p.longitude,
                  altitude: p.altitude
                }));
                
                console.log(`📍 使用最近邻排序重新排列了 ${orderedPoints.length} 个点`);
              } else {
                // 点数太多，使用原始顺序避免计算复杂度过高
                route.trackPoints = placemarkPoints.map(p => ({
                  latitude: p.latitude,
                  longitude: p.longitude,
                  altitude: p.altitude
                }));
                
                console.log(`📍 点数较多(${placemarkPoints.length})，使用原始顺序`);
              }
            }
            
            console.log(`🔍 解析KML结果: ${route.name}, 轨迹点: ${route.trackPoints.length}, 标注点: ${route.placemarks.length}`);
            
          } catch (parseError) {
            console.warn(`⚠️ 无法解析KML文件内容 ${kmlFile.fileName}, 使用元数据:`, parseError);
            
            // 如果解析失败，使用元数据中的起终点信息
            if (kmlFile.startLatitude && kmlFile.startLongitude && 
                kmlFile.endLatitude && kmlFile.endLongitude) {
              route.trackPoints = [
                { latitude: kmlFile.startLatitude, longitude: kmlFile.startLongitude },
                { latitude: kmlFile.endLatitude, longitude: kmlFile.endLongitude }
              ];
            }
          }
          
          // 设置起终点
          if (route.trackPoints.length > 0) {
            route.startPoint = route.trackPoints[0];
            route.endPoint = route.trackPoints[route.trackPoints.length - 1];
          }
          
          routes.push(route);
          processedCount++;
          console.log(`✅ 成功处理KML路线: ${route.name} (${route.trackPoints.length} 个轨迹点)`);
          
        } catch (err) {
          console.error(`❌ 处理KML文件失败: ${kmlFile.fileName}`, err);
        }
      }
      
      if (isComponentMountedRef.current) {
        setKmlRoutes(routes);
        console.log(`🎯 总共处理了 ${processedCount} 条KML路线`);
      }
      
    } catch (err) {
      if (isComponentMountedRef.current) {
        console.error('❌ KML路线加载失败:', err);
        setError(err instanceof Error ? err.message : '获取KML路线数据失败');
      }
    } finally {
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enableKMLLoading]);

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

    // 检查是否使用HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setLocationLoading(false);
      setLocationError('位置获取需要HTTPS连接，请使用HTTPS访问此页面');
      return;
    }

    // 尝试多种定位策略
    const tryLocationStrategies = async () => {
      const strategies = [
        // 策略1: 高精度定位
        () => new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        }),
        
        // 策略2: 低精度定位（更快的网络定位）
        () => new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000
          });
        }),
        
        // 策略3: 使用缓存位置
        () => new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 600000 // 10分钟内的缓存
          });
        })
      ];

      for (let i = 0; i < strategies.length; i++) {
        try {
          console.log(`尝试定位策略 ${i + 1}...`);
          const position = await strategies[i]();
          return position;
        } catch (error) {
          console.log(`策略 ${i + 1} 失败:`, error);
          if (i === strategies.length - 1) {
            throw error;
          }
        }
      }
    };

    tryLocationStrategies()
      .then((position) => {
        if (!position || !position.coords) {
          throw new Error('位置数据无效');
        }
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
      })
      .catch((error) => {
        setLocationLoading(false);
        let errorMessage = '获取位置失败';
        let errorDetails = '';
        let suggestions = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置权限被拒绝';
            errorDetails = '浏览器拒绝了位置访问请求';
            suggestions = '请点击地址栏左侧的定位图标，或检查浏览器设置中的位置权限';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            errorDetails = '无法获取当前位置信息';
            suggestions = '请检查网络连接，确保设备定位服务已开启，或尝试刷新页面';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            errorDetails = '定位请求超时';
            suggestions = '请检查网络连接，或稍后重试';
            break;
          default:
            errorMessage = '获取位置时发生未知错误';
            errorDetails = '定位服务出现异常';
            suggestions = '请刷新页面后重试，或检查设备定位设置';
        }
        
        const fullError = `${errorMessage} - ${errorDetails}`;
        setLocationError(fullError);
        console.error('获取位置失败:', error);
        
        // 显示详细的错误信息和建议
        console.log('位置获取失败详情:', {
          error: fullError,
          suggestions,
          code: error.code,
          message: error.message
        });
      });
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

    // KML数据加载移到单独的useEffect中，避免重复调用

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

  // 更新KML路线
  useEffect(() => {
    if (!mapInstanceRef.current || !enableKMLLoading || !mapReady) return;

    // 清理现有KML路线和标注点
    clearKMLLines();
    clearKMLPlacemarks();

    // 限制显示的KML路线数量
    const MAX_KML_ROUTES_DISPLAY = 10;
    const kmlRoutesToShow = kmlRoutes.slice(0, MAX_KML_ROUTES_DISPLAY);

    // 添加KML路线
    kmlRoutesToShow.forEach((route, index) => {
      if (route.trackPoints && route.trackPoints.length > 0) {
        // 转换坐标格式
        const coordinates: [number, number][] = route.trackPoints.map(point => [
          point.latitude,
          point.longitude
        ]);

        const polyline = L.polyline(coordinates, {
          color: '#FF6B35', // KML路线使用橙色
          weight: 4,
          opacity: 0.8
        }).bindPopup(`
          <div class="kml-route-popup">
            <h3 class="font-bold text-lg">${route.name || `KML路线 ${index + 1}`}</h3>
            <p class="text-sm text-gray-600">距离: ${route.totalDistance ? `${(route.totalDistance / 1000).toFixed(2)}km` : '未知'}</p>
            <p class="text-sm text-gray-600">出行方式: ${route.travelMode || '未知'}</p>
            ${route.creatorName ? `<p class="text-sm text-gray-600">创建者: ${route.creatorName}</p>` : ''}
            ${route.tags && route.tags.length > 0 ? `<p class="text-sm text-gray-600">标签: ${route.tags.join(', ')}</p>` : ''}
          </div>
        `);

        polyline.addTo(mapInstanceRef.current!);
        kmlRouteLinesRef.current.push(polyline);

        // 添加点击事件
        if (onKMLRouteClick) {
          polyline.on('click', () => {
            onKMLRouteClick(route);
          });
        }
      }

      // 添加KML标注点（只显示重要的标注点，如起点、终点、特殊标注点）
      if (route.placemarks && route.placemarks.length > 0) {
        route.placemarks.forEach(placemark => {
          if (placemark.coordinate) {
            // 只显示有名称或特殊类型的标注点，避免显示所有轨迹点
            const shouldShow = placemark.name || 
                              placemark.type === '起点' || 
                              placemark.type === '终点' ||
                              placemark.type === 'startPoint' ||
                              placemark.type === 'endPoint' ||
                              (placemark.attachments && placemark.attachments.length > 0);
            
            if (shouldShow) {
              // 为不同类型的标注点使用不同的图标
              let icon;
              if (placemark.type === '起点' || placemark.type === 'startPoint') {
                // 起点使用绿色圆点
                icon = L.divIcon({
                  className: 'kml-start-point',
                  html: '<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                });
              } else if (placemark.type === '终点' || placemark.type === 'endPoint') {
                // 终点使用红色圆点
                icon = L.divIcon({
                  className: 'kml-end-point',
                  html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                });
              } else if (placemark.attachments && placemark.attachments.length > 0) {
                // 有附件的标注点使用蓝色圆点
                icon = L.divIcon({
                  className: 'kml-attachment-point',
                  html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                });
              } else {
                // 其他标注点使用小圆点
                icon = L.divIcon({
                  className: 'kml-placemark-point',
                  html: '<div class="w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm"></div>',
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                });
              }

              const marker = L.marker([placemark.coordinate.latitude, placemark.coordinate.longitude], { icon })
                .bindPopup(`
                  <div class="kml-placemark-popup">
                    <h3 class="font-bold text-lg">${placemark.name || '标注点'}</h3>
                    ${placemark.description ? `<p class="text-sm mt-2">${placemark.description}</p>` : ''}
                    ${placemark.type ? `<p class="text-xs text-gray-500 mt-1">类型: ${placemark.type}</p>` : ''}
                    ${placemark.attachments && placemark.attachments.length > 0 ? 
                      `<p class="text-xs text-blue-500 mt-1">📎 包含 ${placemark.attachments?.length || 0} 个附件</p>` : ''}
                  </div>
                `);

              marker.addTo(mapInstanceRef.current!);
              kmlPlacemarkMarkersRef.current.push(marker);
            }
          }
        });
      }
    });
  }, [kmlRoutes, enableKMLLoading, mapReady, clearKMLLines, clearKMLPlacemarks, onKMLRouteClick]);

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

  // KML数据加载 - 单独处理避免重复调用
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || !enableKMLLoading) return;
    
    console.log('🗺️ 地图就绪，开始加载KML数据');
    fetchKMLRoutes();
  }, [mapReady, enableKMLLoading, fetchKMLRoutes]);

  // 处理设置变化 - 不包含KML加载
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    // 重新加载POI和路线数据
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
          className={`p-3 rounded-lg shadow-md border transition-all duration-200 ${
            locationLoading 
              ? 'bg-blue-100 border-blue-300 text-blue-600 cursor-not-allowed' 
              : currentLocation
                ? 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
          title={locationLoading ? '正在获取位置...' : currentLocation ? '重新获取位置' : '获取当前位置'}
        >
          {locationLoading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : currentLocation ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
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
        <div className="absolute top-16 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md max-w-sm">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">📍 位置获取失败</p>
              <p className="text-xs mt-1">{locationError}</p>
              <button 
                onClick={() => getCurrentLocation()}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-2 transition-colors"
              >
                重试
              </button>
            </div>
            <button 
              onClick={() => setLocationError(null)}
              className="text-red-500 hover:text-red-700 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* 数据统计 */}
      {(pois.length > 0 || routeData.length > 0 || kmlRoutes.length > 0 || currentLocation) && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md">
          <div className="text-xs text-gray-600">
            {pois.length > 0 && <div>POI: {pois.length}个</div>}
            {routeData.length > 0 && <div>路线: {routeData.length}条</div>}
            {kmlRoutes.length > 0 && <div>KML路线: {kmlRoutes.length}条</div>}
            {enableRouteLoading && <div>路线加载: 已启用</div>}
            {!enableRouteLoading && <div>路线加载: 已禁用</div>}
            {enableKMLLoading && <div>KML加载: 已启用</div>}
            {!enableKMLLoading && <div>KML加载: 已禁用</div>}
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