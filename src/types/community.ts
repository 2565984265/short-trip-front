// 社区系统类型定义

export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  bio?: string;
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
  id: number;
  contentType?: string;
  contentId?: number;
  postId?: number; // 保持向后兼容
  parentId?: number;
  userId: number;
  userNickname: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  likeCount: number;
  isLiked?: boolean;
  isOwned?: boolean;
  createTime: string;
  replies?: Comment[];
}

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
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
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  activeUsers: number;
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

export interface CreateCommentRequest {
  content: string;
  parentId?: number;
}

// 评论展示相关类型
export interface CommentDisplayProps {
  comments: Comment[];
  loading?: boolean;
  onLike?: (commentId: number) => void;
  onUnlike?: (commentId: number) => void;
  onReply?: (parentId: number, content: string) => void;
  onDelete?: (commentId: number) => void;
}