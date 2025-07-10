'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复Leaflet默认图标路径问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
    type?: 'scenic' | 'supply' | 'camping';
  }>;
  routes?: Array<{
    coordinates: [number, number][];
    color?: string;
    name?: string;
  }>;
}

export default function Map({ 
  center = [39.9042, 116.4074], // 默认北京
  zoom = 10,
  markers = [],
  routes = []
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // 创建地图实例
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // 使用更稳定的地图服务 - CartoDB Positron
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 1,
    });

    // 添加错误处理，如果主服务失败则使用备用服务
    tileLayer.on('tileerror', (e) => {
      console.warn('主地图服务失败，切换到备用服务');
      if (e.tile.src.includes('cartocdn.com')) {
        const backupLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        });
        backupLayer.addTo(map);
      }
    });

    tileLayer.addTo(map);

    // 添加标记点
    markers.forEach(({ position, title, description, type }) => {
      const marker = L.marker(position).addTo(map);
      
      // 根据类型设置不同的图标颜色
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

      // 添加弹出信息
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${title}</h3>
          ${description ? `<p style="margin: 0; color: #666; font-size: 14px;">${description}</p>` : ''}
          ${type ? `<span style="display: inline-block; padding: 2px 8px; background: ${iconColor}; color: white; border-radius: 12px; font-size: 12px; margin-top: 8px;">${type}</span>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // 添加路线
    routes.forEach(({ coordinates, color = '#3388ff', name }) => {
      const polyline = L.polyline(coordinates, {
        color,
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      if (name) {
        // 在路线中间添加标签
        const midPoint = coordinates[Math.floor(coordinates.length / 2)];
        L.marker(midPoint).addTo(map).bindPopup(name);
      }
    });

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers, routes]);

  return (
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
  );
} 