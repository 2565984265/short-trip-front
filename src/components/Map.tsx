'use client';

import dynamic from 'next/dynamic';

// 动态导入Leaflet，避免服务端渲染问题
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">加载地图中...</div>
});

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

interface MapProps {
  center?: [number, number]; // 默认杭州市中心
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
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

export default function Map({ center = [30.2741, 120.1551], zoom = 11, ...rest }: MapProps) {
  return <MapComponent center={center} zoom={zoom} {...rest} />;
} 