// 攻略内容系统类型定义

export interface Guide {
  id: number;
  title: string;
  content: string;
  author: string;
  summary: string;
  tags: string[];
  coverImage: string;
  images: string[];
  difficultyLevel: string;
  difficultyLevelDisplay: string;
  estimatedTime: string;
  estimatedCost: string;
  destination: string;
  season: string;
  transportMode: string;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  rating: number;
  ratingCount: number;
  createTime: string;
  updateTime: string;
}

export interface GuideFilter {
  difficultyLevel?: string;
  destination?: string;
  season?: string;
  transportMode?: string;
  keyword?: string;
  sortBy?: 'createTime' | 'viewCount' | 'rating';
  sortDir?: 'asc' | 'desc';
}

export interface GuideSearchParams {
  page?: number;
  size?: number;
  difficultyLevel?: string;
  destination?: string;
  season?: string;
  transportMode?: string;
  keyword?: string;
  sortBy?: string;
  sortDir?: string;
}

export const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: '简单', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DIFFICULT', label: '困难', color: 'bg-orange-100 text-orange-800' },
  { value: 'EXPERT', label: '专家', color: 'bg-red-100 text-red-800' }
];

export const SEASONS = [
  { value: '春季', label: '春季' },
  { value: '夏季', label: '夏季' },
  { value: '秋季', label: '秋季' },
  { value: '冬季', label: '冬季' },
  { value: '四季皆宜', label: '四季皆宜' }
];

export const TRANSPORT_MODES = [
  { value: '自驾', label: '自驾' },
  { value: '飞机', label: '飞机' },
  { value: '高铁', label: '高铁' },
  { value: '公交', label: '公交' },
  { value: '步行', label: '步行' },
  { value: '包车', label: '包车' }
]; 