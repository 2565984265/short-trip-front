'use client';

import dynamic from 'next/dynamic';

// 动态导入Leaflet，避免服务端渲染问题
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">加载地图中...</div>
});

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
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

export default function Map(props: MapProps) {
  return <MapComponent {...props} />;
} 