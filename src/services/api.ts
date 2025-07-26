// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 工具函数：获取完整的文件URL
export function getFileUrl(relativePath: string | null | undefined): string {
  if (!relativePath) {
    return '/images/placeholder.jpg';
  }
  
  // 如果是相对路径（以/api/开头），则添加域名
  if (relativePath.startsWith('/api/')) {
    return `${API_BASE_URL}${relativePath}`;
  }
  
  // 如果是完整URL或本地路径，直接返回
  return relativePath;
}

// 获取认证token的工具函数
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// 认证状态管理工具函数
export const authUtils = {
  // 获取token
  getToken: getAuthToken,
  
  // 设置token
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  // 清除认证信息
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  // 检查是否已登录
  isAuthenticated: () => {
    return !!getAuthToken();
  },
  
  // 获取用户信息
  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },
  
  // 设置用户信息
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
};

// 通用请求方法
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  // 如果body是FormData，不设置Content-Type，让浏览器自动设置
  const isFormData = options.body instanceof FormData;
  
  // 开发环境下的调试日志
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 API Request: ${endpoint}`);
    console.log(`🔑 Token status: ${token ? 'Present' : 'Missing'}`);
    console.log(`🔑 Token value: ${token ? token.substring(0, 30) + '...' : 'null'}`);
    console.log(`🔑 Token type: ${typeof token}`);
    console.log(`🔑 Token truthiness: ${!!token}`);
    if (isFormData) {
      console.log('FormData detected, Content-Type will be auto-set by browser');
    }
  }
  
  // 手动构建headers对象
  const headers: Record<string, string> = {};
  
  // 先添加其他自定义headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  // 然后添加Content-Type（如果不是FormData且没有被自定义headers设置）
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  // 最后添加Authorization头（确保不被覆盖）
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Adding Authorization header:', `Bearer ${token.substring(0, 30)}...`);
  }
  
  const config: RequestInit = {
    headers,
    ...options,
  };

  // 开发环境下的详细调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Final request headers:', config.headers);
    console.log('🔍 Headers keys:', Object.keys(headers));
    console.log('🔍 Authorization in headers:', 'Authorization' in headers ? 'YES' : 'NO');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    // 如果是401错误，清除本地存储并跳转到登录页
    if (response.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('登录已过期，请重新登录');
    }
    
    // 尝试解析错误信息
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API请求失败: ${response.status}`);
    } catch (parseError) {
      throw new Error(`API请求失败: ${response.status}`);
    }
  }
  
  return response.json();
}

// 文件下载专用请求方法（返回Blob）
export async function downloadFile(
  endpoint: string,
  filename?: string
): Promise<void> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    // 如果是401错误，清除本地存储并跳转到登录页
    if (response.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('登录已过期，请重新登录');
    }
    
    throw new Error(`下载失败: ${response.status}`);
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// 获取文件内容专用请求方法（返回文本）
export async function getFileContent(endpoint: string): Promise<string> {
  const token = getAuthToken();
  
  // 调试信息
  console.log('🔍 getFileContent - API Request');
  console.log('🔑 Token from getAuthToken():', token ? token.substring(0, 20) + '...' : 'null');
  console.log('🌐 Full URL:', `${API_BASE_URL}${endpoint}`);
  
  const config: RequestInit = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  console.log('📤 Request headers:', config.headers);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  console.log('📥 Response status:', response.status);
  
  if (!response.ok) {
    // 如果是401错误，清除本地存储并跳转到登录页
    if (response.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('登录已过期，请重新登录');
    }
    
    throw new Error(`获取文件内容失败: ${response.status}`);
  }
  
  return response.text();
}

// 动态相关API
export const postAPI = {
  // 获取当前用户的动态
  getMyPosts: (page = 0, size = 10) =>
    apiRequest(`/api/posts/my?page=${page}&size=${size}`),
  
  // 获取用户的动态
  getUserPosts: (userId: number, page = 0, size = 10) =>
    apiRequest(`/api/posts/user/${userId}?page=${page}&size=${size}`),
  
  // 获取公开动态
  getPublicPosts: (page = 0, size = 10) =>
    apiRequest(`/api/posts/public?page=${page}&size=${size}`),
  
  // 获取动态详情
  getPostById: (postId: number) =>
    apiRequest(`/api/posts/${postId}`),
  
  // 创建动态
  createPost: (postData: any) =>
    apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),
  
  // 更新动态
  updatePost: (postId: number, postData: any) =>
    apiRequest(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),
  
  // 删除动态
  deletePost: (postId: number) =>
    apiRequest(`/api/posts/${postId}`, {
      method: 'DELETE',
    }),
  
  // 点赞动态
  likePost: (postId: number) =>
    apiRequest(`/api/posts/${postId}/like`, {
      method: 'POST',
    }),
  
  // 取消点赞
  unlikePost: (postId: number) =>
    apiRequest(`/api/posts/${postId}/like`, {
      method: 'DELETE',
    }),
  
  // 搜索动态
  searchPosts: (keyword: string, page = 0, size = 10) =>
    apiRequest(`/api/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),
  
  // 根据标签查询动态
  getPostsByTag: (tag: string, page = 0, size = 10) =>
    apiRequest(`/api/posts/tag/${encodeURIComponent(tag)}?page=${page}&size=${size}`),
  
  // 获取动态评论
  getComments: (postId: number, page = 0, size = 20) =>
    apiRequest(`/api/posts/${postId}/comments?page=${page}&size=${size}`),
  
  // 添加评论
  addComment: (postId: number, content: string, parentId?: number) =>
    apiRequest(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        parentId
      }),
    }),
  
  // 删除评论
  deleteComment: (postId: number, commentId: number) =>
    apiRequest(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
  
  // 点赞评论
  likeComment: (postId: number, commentId: number) =>
    apiRequest(`/api/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    }),
  
  // 取消点赞评论
  unlikeComment: (postId: number, commentId: number) =>
    apiRequest(`/api/posts/${postId}/comments/${commentId}/like`, {
      method: 'DELETE',
    }),
};

// 攻略相关API
export const guideAPI = {
  // 获取当前用户的攻略
  getMyGuides: (page = 0, size = 10) =>
    apiRequest(`/api/guides/my?page=${page}&size=${size}`),
  
  // 获取用户的攻略
  getUserGuides: (userId: number, page = 0, size = 10) =>
    apiRequest(`/api/guides/user/${userId}?page=${page}&size=${size}`),
  
  // 获取攻略列表
  getGuides: (page = 0, size = 10, sortBy = 'createTime', sortDir = 'desc') =>
    apiRequest(`/api/guides?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  
  // 获取攻略详情
  getGuideById: (guideId: number) =>
    apiRequest(`/api/guides/${guideId}`),
  
  // 创建攻略
  createGuide: (guideData: any) =>
    apiRequest('/api/guides', {
      method: 'POST',
      body: JSON.stringify(guideData),
    }),
  
  // 更新攻略
  updateGuide: (guideId: number, guideData: any) =>
    apiRequest(`/api/guides/${guideId}`, {
      method: 'PUT',
      body: JSON.stringify(guideData),
    }),
  
  // 删除攻略
  deleteGuide: (guideId: number) =>
    apiRequest(`/api/guides/${guideId}`, {
      method: 'DELETE',
    }),
  
  // 点赞攻略
  likeGuide: (guideId: number) =>
    apiRequest(`/api/guides/${guideId}/like`, {
      method: 'POST',
    }),
  
  // 收藏攻略
  favoriteGuide: (guideId: number) =>
    apiRequest(`/api/guides/${guideId}/favorite`, {
      method: 'POST',
    }),
  
  // 评分攻略
  rateGuide: (guideId: number, rating: number) =>
    apiRequest(`/api/guides/${guideId}/rate?rating=${rating}`, {
      method: 'POST',
    }),
  
  // 搜索攻略
  searchGuides: (keyword: string, page = 0, size = 10) =>
    apiRequest(`/api/guides/search/keyword?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),
  
  // 根据目的地搜索攻略
  searchGuidesByDestination: (destination: string, page = 0, size = 10) =>
    apiRequest(`/api/guides/search/destination?destination=${encodeURIComponent(destination)}&page=${page}&size=${size}`),
  
  // 根据标签搜索攻略
  searchGuidesByTag: (tag: string, page = 0, size = 10) =>
    apiRequest(`/api/guides/search/tag?tag=${encodeURIComponent(tag)}&page=${page}&size=${size}`),
  
  // 根据难度等级获取攻略
  getGuidesByDifficulty: (difficulty: string, page = 0, size = 10) =>
    apiRequest(`/api/guides/difficulty/${difficulty}?page=${page}&size=${size}`),
  
  // 获取精选攻略
  getFeaturedGuides: () =>
    apiRequest('/api/guides/featured'),
};

// 用户相关API
export const userAPI = {
  // 获取当前用户信息
  getCurrentUser: () =>
    apiRequest('/api/auth/me'),
  
  // 更新用户信息
  updateProfile: (userData: any) =>
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// 文件相关API
export const fileAPI = {
  // 上传头像
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/api/files/upload/avatar', {
      method: 'POST',
      body: formData,
      // 不设置headers，让apiRequest自动处理Authorization和Content-Type
    });
  },
  
  // 上传文件
  uploadFile: (file: File, category?: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);
    return apiRequest('/api/files/upload', {
      method: 'POST',
      body: formData,
      // 不设置headers，让apiRequest自动处理Authorization和Content-Type
    });
  },
  
  // 获取用户文件列表
  getUserFiles: (category?: string) =>
    apiRequest(`/api/files/my${category ? `?category=${category}` : ''}`),
  
  // 删除文件
  deleteFile: (fileId: number) =>
    apiRequest(`/api/files/${fileId}`, {
      method: 'DELETE',
    }),
};

// 社区相关API
export const communityAPI = {
  // 获取社区帖子列表
  getPosts: (page = 0, size = 20) =>
    apiRequest(`/api/community/posts?page=${page}&size=${size}`),
  
  // 根据类型获取帖子
  getPostsByType: (type: string, page = 0, size = 20) =>
    apiRequest(`/api/community/posts/type/${type}?page=${page}&size=${size}`),
  
  // 获取热门帖子
  getHotPosts: (limit = 10) =>
    apiRequest(`/api/community/posts/hot?limit=${limit}`),
  
  // 获取精华帖子
  getFeaturedPosts: (limit = 10) =>
    apiRequest(`/api/community/posts/featured?limit=${limit}`),
  
  // 获取置顶帖子
  getPinnedPosts: () =>
    apiRequest('/api/community/posts/pinned'),
  
  // 根据ID获取帖子
  getPostById: (postId: number) =>
    apiRequest(`/api/community/posts/${postId}`),
  
  // 创建帖子
  createPost: (postData: any) =>
    apiRequest('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),
  
  // 更新帖子
  updatePost: (postId: number, postData: any) =>
    apiRequest(`/api/community/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),
  
  // 删除帖子
  deletePost: (postId: number) =>
    apiRequest(`/api/community/posts/${postId}`, {
      method: 'DELETE',
    }),
  
  // 点赞帖子
  likePost: (postId: number) =>
    apiRequest(`/api/community/posts/${postId}/like`, {
      method: 'POST',
    }),
  
  // 收藏帖子
  favoritePost: (postId: number) =>
    apiRequest(`/api/community/posts/${postId}/favorite`, {
      method: 'POST',
    }),
  
  // 搜索帖子
  searchPosts: (keyword: string) =>
    apiRequest(`/api/community/posts/search?keyword=${encodeURIComponent(keyword)}`),
  
  // 根据标签搜索帖子
  searchPostsByTag: (tag: string) =>
    apiRequest(`/api/community/posts/tag/${encodeURIComponent(tag)}`),
  
  // 获取帖子统计
  getPostStats: () =>
    apiRequest('/api/community/posts/stats'),
  
  // ==================== 社区评论相关接口 ====================
  
  // 获取社区帖子评论
  getComments: (postId: number, page = 0, size = 20) =>
    apiRequest(`/api/community/posts/${postId}/comments?page=${page}&size=${size}`),
  
  // 添加社区帖子评论
  addComment: (postId: number, content: string, parentId?: number) =>
    apiRequest(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        parentId
      }),
    }),
  
  // 删除社区帖子评论
  deleteComment: (postId: number, commentId: number) =>
    apiRequest(`/api/community/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
  
  // 点赞社区帖子评论
  likeComment: (postId: number, commentId: number) =>
    apiRequest(`/api/community/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    }),
  
  // 取消点赞社区帖子评论
  unlikeComment: (postId: number, commentId: number) =>
    apiRequest(`/api/community/posts/${postId}/comments/${commentId}/like`, {
      method: 'DELETE',
    }),
};

// 导出类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
} 