import { TravelMode } from './route';

// KML文件上传响应类型
export interface KMLFileUploadResponse {
  id: number;
  kmlId: string;
  fileName: string;
  fileSize: number;
  documentName?: string;
  documentDescription?: string;
  routeName?: string;
  routeDescription?: string;
  startLongitude?: number;
  startLatitude?: number;
  endLongitude?: number;
  endLatitude?: number;
  totalDistance?: number;
  totalDuration?: number;
  averageSpeed?: number;
  maxAltitude?: number;
  minAltitude?: number;
  totalAscent?: number;
  totalDescent?: number;
  trackPointCount?: number;
  placemarkCount?: number;
  travelMode?: TravelMode;
  tags?: string;
  creatorName?: string;
  createTime?: number;
  dataSource?: string;
  version?: string;
  isPublic: boolean;
  isRecommended: boolean;
  isPopular: boolean;
  rating?: number;
  ratingCount: number;
  viewCount: number;
  favoriteCount: number;
  fileUrl: string;
  uploadTime: string;
  updateTime: string;
  remarks?: string;
}

// KML文件搜索参数类型
export interface KMLFileSearchParams {
  page?: number;
  size?: number;
  travelMode?: TravelMode;
  tag?: string;
  keyword?: string;
  minLng?: number;
  minLat?: number;
  maxLng?: number;
  maxLat?: number;
  minDistance?: number;
  maxDistance?: number;
  minAltitude?: number;
  maxAltitude?: number;
  limit?: number;
}

// KML文件更新参数类型
export interface KMLFileUpdateParams {
  remarks?: string;
  isPublic?: boolean;
}

// KML文件统计信息类型
export interface KMLFileStats {
  totalFiles: number;
  publicFiles: number;
  travelModeStats: Record<string, number>;
}

// KML文件上传表单类型
export interface KMLFileUploadForm {
  file: File;
  remarks?: string;
}

// KML文件列表响应类型
export interface KMLFileListResponse {
  content: KMLFileUploadResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
} 