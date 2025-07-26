import { apiRequest } from './api';

// KML文件相关API
export const kmlAPI = {
  // 检查用户是否有上传权限
  checkUploadPermission: () =>
    apiRequest('/api/kml-files/upload-permission'),

  // 更新KML文件信息
  updateKMLFile: (fileId: number, data: any) =>
    apiRequest(`/api/kml-files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 上传KML文件
  uploadKMLFile: (file: File, remarks?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (remarks) formData.append('remarks', remarks);
    return apiRequest('/api/kml-files/upload', {
      method: 'POST',
      body: formData,
    });
  },
  
  // 获取用户的KML文件列表
  getUserKMLFiles: () =>
    apiRequest('/api/kml-files/my'),
  
  // 分页获取用户的KML文件
  getUserKMLFilesPage: (page: number = 0, size: number = 10) =>
    apiRequest(`/api/kml-files/my/page?page=${page}&size=${size}`),
  
  // 获取公开的KML文件列表（分页）
  getPublicKMLFiles: (page: number = 0, size: number = 10) =>
    apiRequest(`/api/kml-files/public?page=${page}&size=${size}`),
  
  // 根据出行方式获取KML文件
  getKMLFilesByTravelMode: (travelMode: string) =>
    apiRequest(`/api/kml-files/travel-mode/${travelMode}`),
  
  // 获取推荐的KML文件
  getRecommendedKMLFiles: () =>
    apiRequest('/api/kml-files/recommended'),
  
  // 获取热门的KML文件
  getPopularKMLFiles: () =>
    apiRequest('/api/kml-files/popular'),
  
  // 根据标签查找KML文件
  getKMLFilesByTag: (tag: string) =>
    apiRequest(`/api/kml-files/tag/${encodeURIComponent(tag)}`),
  
  // 根据区域查找KML文件
  getKMLFilesByArea: (minLng: number, minLat: number, maxLng: number, maxLat: number) =>
    apiRequest(`/api/kml-files/area?minLng=${minLng}&minLat=${minLat}&maxLng=${maxLng}&maxLat=${maxLat}`),
  
  // 根据距离范围查找KML文件
  getKMLFilesByDistanceRange: (minDistance: number, maxDistance: number) =>
    apiRequest(`/api/kml-files/distance?minDistance=${minDistance}&maxDistance=${maxDistance}`),
  
  // 根据海拔范围查找KML文件
  getKMLFilesByAltitudeRange: (minAltitude: number, maxAltitude: number) =>
    apiRequest(`/api/kml-files/altitude?minAltitude=${minAltitude}&maxAltitude=${maxAltitude}`),
  
  // 获取评分最高的KML文件
  getTopRatedKMLFiles: (limit: number = 10) =>
    apiRequest(`/api/kml-files/top-rated?limit=${limit}`),
  
  // 获取最新的KML文件
  getLatestKMLFiles: (limit: number = 10) =>
    apiRequest(`/api/kml-files/latest?limit=${limit}`),
  
  // 搜索KML文件
  searchKMLFiles: (keyword: string) =>
    apiRequest(`/api/kml-files/search?keyword=${encodeURIComponent(keyword)}`),
  
  // 删除KML文件
  deleteKMLFile: (fileId: number) =>
    apiRequest(`/api/kml-files/${fileId}`, {
      method: 'DELETE',
    }),
  
  // 更新KML文件信息
  updateKMLFileInfo: (fileId: number, remarks?: string, isPublic?: boolean) => {
    const params = new URLSearchParams();
    if (remarks) params.append('remarks', remarks);
    if (isPublic !== undefined) params.append('isPublic', isPublic.toString());
    return apiRequest(`/api/kml-files/${fileId}?${params.toString()}`, {
      method: 'PUT',
    });
  },
  
  // 增加浏览次数
  incrementViewCount: (fileId: number) =>
    apiRequest(`/api/kml-files/${fileId}/view`, {
      method: 'POST',
    }),
  
  // 增加收藏次数
  incrementFavoriteCount: (fileId: number) =>
    apiRequest(`/api/kml-files/${fileId}/favorite`, {
      method: 'POST',
    }),
  
  // 评分KML文件
  rateKMLFile: (fileId: number, rating: number) =>
    apiRequest(`/api/kml-files/${fileId}/rate?rating=${rating}`, {
      method: 'POST',
    }),
  
  // 获取KML文件统计信息
  getKMLFileStats: () =>
    apiRequest('/api/kml-files/stats'),
  
  // 获取KML文件下载URL
  getKMLFileDownloadUrl: (fileId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/kml-files/${fileId}/download`,
  
  // 获取KML文件查看URL
  getKMLFileViewUrl: (fileId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/kml-files/${fileId}`,
  
  // 保存在线制作的KML文件
  createOnlineKML: (kmlData: any) =>
    apiRequest('/api/kml-files/create-online', {
      method: 'POST',
      body: JSON.stringify(kmlData),
    }),
}; 