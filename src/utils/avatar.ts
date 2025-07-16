// 头像URL处理工具

const API_BASE_URL = 'http://localhost:8080';

/**
 * 处理头像URL，确保指向正确的后端地址
 * @param avatarUrl 原始头像URL或文件ID
 * @returns 处理后的头像URL
 */
export function getAvatarUrl(avatarUrl?: string): string | null {
  if (!avatarUrl) {
    return null;
  }

  // 如果已经是完整的URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // 如果是相对路径（如 /api/files/123 或 /avatars/user1.jpg），添加后端基础URL
  if (avatarUrl.startsWith('/')) {
    return `${API_BASE_URL}${avatarUrl}`;
  }

  // 如果是数字（文件ID），通过文件API访问
  if (/^\d+$/.test(avatarUrl)) {
    return `${API_BASE_URL}/api/files/${avatarUrl}`;
  }

  // 如果是文件名，假设存储在 /api/files/ 路径下
  return `${API_BASE_URL}/api/files/${avatarUrl}`;
}

/**
 * 获取默认头像URL
 * @returns 默认头像URL
 */
export function getDefaultAvatarUrl(): string {
  return `${API_BASE_URL}/api/files/default-avatar.png`;
} 