// AI模块类型定义

// AI助手消息类型
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: string[];
  intent?: string;
  metadata?: {
    location?: string;
    travelType?: string;
    duration?: number;
  };
}

// AI响应类型
export interface AIResponse {
  id: string;
  content: string;
  timestamp: Date;
  sources?: string[];
  intent?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

// AI对话会话
export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// AI路线推荐请求
export interface AIRouteRequest {
  startLocation: string;
  endLocation?: string;
  duration: number; // 小时
  travelType: 'walking' | 'cycling' | 'motorcycle' | 'car' | 'rv';
  preferences: {
    scenery?: string[]; // 风景偏好
    difficulty?: 'easy' | 'medium' | 'hard';
    budget?: 'low' | 'medium' | 'high';
    interests?: string[]; // 兴趣点
    avoidHighways?: boolean;
    includeCamping?: boolean;
  };
  constraints?: {
    maxDistance?: number;
    mustVisit?: string[];
    avoidAreas?: string[];
  };
}

// AI路线推荐结果
export interface AIRouteRecommendation {
  id: string;
  title: string;
  description: string;
  route: {
    coordinates: [number, number][];
    totalDistance: number;
    estimatedTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    transportation: string;
  };
  waypoints: Array<{
    id: string;
    name: string;
    type: 'scenic' | 'supply' | 'camping' | 'restaurant' | 'hotel';
    coordinates: [number, number];
    description: string;
    estimatedTime: number;
    rating?: number;
    tips?: string[];
  }>;
  highlights: string[];
  tips: string[];
  warnings: string[];
  equipment: Array<{
    category: string;
    name: string;
    description: string;
    isRequired: boolean;
    price?: number;
  }>;
  weatherAdvice?: string;
  bestTime?: string;
  confidence: number; // 0-1
  alternatives?: AIRouteRecommendation[];
}

// AI智能分析结果
export interface AIAnalysis {
  id: string;
  type: 'route' | 'destination' | 'weather' | 'traffic' | 'safety';
  title: string;
  summary: string;
  details: {
    keyPoints: string[];
    recommendations: string[];
    warnings: string[];
    statistics?: Record<string, any>;
  };
  confidence: number;
  timestamp: Date;
}

// AI助手功能类型
export type AIAssistantFunction = 
  | 'route_planning'
  | 'weather_check'
  | 'traffic_analysis'
  | 'safety_assessment'
  | 'equipment_recommendation'
  | 'budget_planning'
  | 'emergency_help'
  | 'general_qa';

// AI助手状态
export interface AIAssistantState {
  isTyping: boolean;
  isProcessing: boolean;
  currentFunction?: AIAssistantFunction;
  context?: {
    location?: string;
    travelType?: string;
    duration?: number;
    preferences?: Record<string, any>;
  };
}

// AI设置
export interface AISettings {
  language: 'zh-CN' | 'en-US';
  responseStyle: 'concise' | 'detailed' | 'casual' | 'professional';
  enableVoice: boolean;
  enableNotifications: boolean;
  privacyLevel: 'basic' | 'enhanced' | 'full';
  dataSharing: boolean;
}

// AI使用统计
export interface AIUsageStats {
  totalConversations: number;
  totalMessages: number;
  routeRecommendations: number;
  analysisRequests: number;
  averageResponseTime: number;
  userSatisfaction: number;
  lastUsed: Date;
}

// AI错误类型
export interface AIError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;
} 