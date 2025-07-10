// 攻略内容系统类型定义

export interface Guide {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isCreator: boolean;
  };
  route: {
    startLocation: string;
    endLocation: string;
    waypoints: Waypoint[];
    totalDistance: number; // 公里
    estimatedTime: number; // 小时
    difficulty: 'easy' | 'medium' | 'hard';
    transportation: 'walking' | 'cycling' | 'motorcycle' | 'car' | 'rv';
  };
  content: {
    overview: string;
    highlights: string[];
    itinerary: ItineraryDay[];
    tips: string[];
    equipment: Equipment[];
    warnings: string[];
  };
  media: {
    coverImage: string;
    images: string[];
    videos: Video[];
  };
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
}

export interface Waypoint {
  id: string;
  name: string;
  type: 'scenic' | 'restaurant' | 'hotel' | 'camping' | 'supply' | 'other';
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  estimatedTime: number; // 停留时间（分钟）
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  waypoints: string[]; // waypoint IDs
  estimatedTime: number; // 小时
  accommodation?: string;
  meals?: string[];
}

export interface Equipment {
  category: 'clothing' | 'gear' | 'electronics' | 'food' | 'safety' | 'other';
  name: string;
  description: string;
  isRequired: boolean;
  price?: number;
  purchaseLink?: string;
}

export interface Video {
  platform: 'douyin' | 'xiaohongshu' | 'youtube' | 'other';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface GuideFilter {
  transportation?: Guide['route']['transportation'];
  difficulty?: Guide['route']['difficulty'];
  duration?: {
    min?: number;
    max?: number;
  };
  distance?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  location?: string;
}

export interface GuideSearchParams {
  query?: string;
  filter?: GuideFilter;
  sortBy?: 'rating' | 'createdAt' | 'viewCount' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateGuideData {
  title: string;
  description: string;
  route: Omit<Guide['route'], 'waypoints'> & {
    waypoints: Omit<Waypoint, 'id'>[];
  };
  content: {
    overview: string;
    highlights: string[];
    itinerary: Omit<ItineraryDay, 'waypoints'> & {
      waypoints: string[]; // waypoint names
    }[];
    tips: string[];
    equipment: Omit<Equipment, 'id'>[];
    warnings: string[];
  };
  media: {
    coverImage: string;
    images: string[];
    videos: Omit<Video, 'id'>[];
  };
  tags: string[];
} 