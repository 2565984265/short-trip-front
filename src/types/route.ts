export interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  description?: string;
  type?: string;
}

export interface Route {
  id: number;
  name: string;
  description?: string;
  travelMode: TravelMode;
  difficulty: number;
  estimatedDuration: number;
  distance: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  startLongitude: number;
  startLatitude: number;
  endLongitude: number;
  endLatitude: number;
  pathPoints: RoutePoint[];
  tags?: string;
  isRecommended: boolean;
  isPopular: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
}

export enum TravelMode {
  WALKING = 'WALKING',
  CYCLING = 'CYCLING',
  MOTORCYCLE = 'MOTORCYCLE',
  DRIVING = 'DRIVING',  // 修改为与后端一致的值
  RV = 'RV',
  HIKING = 'HIKING',
  CAMPING = 'CAMPING'
}

export interface RouteFilters {
  travelModes?: TravelMode[];
  difficulty?: number;
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
  isRecommended?: boolean;
  isPopular?: boolean;
}

export interface RouteSearchParams {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  travelModes?: TravelMode[];
}

export interface RouteCreateRequest {
  name: string;
  description?: string;
  travelMode: TravelMode;
  difficulty: number;
  estimatedDuration: number;
  distance: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  startLongitude: number;
  startLatitude: number;
  endLongitude: number;
  endLatitude: number;
  pathPoints: RoutePoint[];
  tags?: string;
  isRecommended?: boolean;
  isPopular?: boolean;
}

export interface RouteUpdateRequest extends RouteCreateRequest {
  id: number;
} 