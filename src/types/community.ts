// 社区系统类型定义

export interface User {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  isCreator: boolean;
  followers: number;
  following: number;
  posts: number;
  guides: number;
  createdAt: string;
  tags: string[];
  location?: string;
  website?: string;
  socialLinks?: {
    weibo?: string;
    wechat?: string;
    douyin?: string;
    xiaohongshu?: string;
  };
}

export interface Post {
  id: string;
  author: User;
  content: string;
  images: string[];
  videos?: Video[];
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  relatedGuide?: string; // 关联的攻略ID
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  images?: string[];
  likes: number;
  createdAt: string;
  replies?: Comment[];
  isLiked?: boolean;
}

export interface Video {
  platform: 'douyin' | 'xiaohongshu' | 'youtube' | 'bilibili' | 'other';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
}

export interface TrendingTopic {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  relatedPosts: string[]; // 相关动态ID
}

export interface CreatorApplication {
  id: string;
  userId: string;
  user: User;
  reason: string;
  portfolio: {
    guides: string[];
    posts: string[];
    socialLinks: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

export interface CommunityStats {
  totalUsers: number;
  totalPosts: number;
  totalCreators: number;
  activeUsers: number;
  trendingTopics: TrendingTopic[];
}

export interface PostFilter {
  author?: string;
  tags?: string[];
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  hasImages?: boolean;
  hasVideos?: boolean;
  minLikes?: number;
  minComments?: number;
}

export interface CreatePostData {
  content: string;
  images?: string[];
  videos?: Omit<Video, 'id'>[];
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  tags: string[];
  relatedGuide?: string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    weibo?: string;
    wechat?: string;
    douyin?: string;
    xiaohongshu?: string;
  };
  tags?: string[];
} 