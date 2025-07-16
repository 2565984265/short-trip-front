import { AIMessage, AIResponse, AIRouteRecommendation, AIConversation } from '@/types/ai';

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: Record<string, any>;
}

export interface RouteRecommendationRequest {
  startLocation?: string;
  endLocation?: string;
  duration?: number;
  travelType?: string;
  interests?: string[];
  budget?: string;
  season?: string;
}

export interface GuideGenerationRequest {
  destination: string;
  travelMode: string;
  duration: number;
  interests?: string[];
}

export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export class AIService {
  private static instance: AIService;
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  
  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 获取授权头信息
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  /**
   * 发送聊天消息
   */
  async sendMessage(request: ChatRequest): Promise<AIServiceResponse<AIResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI聊天请求失败:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * 流式聊天响应
   */
  streamMessage(
    query: string, 
    onMessage: (chunk: string) => void,
    onComplete: (data: any) => void,
    onError: (error: string) => void
  ): EventSource {
    const token = localStorage.getItem('authToken');
    const url = new URL(`${this.baseUrl}/api/ai/chat/stream`);
    url.searchParams.append('query', query);
    
    const eventSource = new EventSource(url.toString(), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    } as any);

    eventSource.addEventListener('start', (event) => {
      console.log('AI开始处理:', event.data);
    });

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.content) {
          onMessage(data.content);
        }
      } catch (e) {
        console.error('解析流式消息失败:', e);
      }
    });

    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data);
        onComplete(data);
      } catch (e) {
        console.error('解析完成事件失败:', e);
      }
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      console.error('流式响应错误:', event);
      onError('连接错误，请重试');
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('EventSource错误:', error);
      onError('连接中断，请重试');
    };

    return eventSource;
  }

  /**
   * 获取路线推荐
   */
  async getRouteRecommendations(
    request: RouteRecommendationRequest
  ): Promise<AIServiceResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/recommendations/route`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('路线推荐请求失败:', error);
      return {
        success: false,
        message: '路线推荐服务暂时不可用，请稍后再试'
      };
    }
  }

  /**
   * 生成旅行指南
   */
  async generateGuide(
    request: GuideGenerationRequest
  ): Promise<AIServiceResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/generate/guide`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('指南生成请求失败:', error);
      return {
        success: false,
        message: '指南生成服务暂时不可用，请稍后再试'
      };
    }
  }

  /**
   * 获取AI服务状态
   */
  async getAIStatus(): Promise<AIServiceResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('获取AI状态失败:', error);
      return {
        success: false,
        message: '无法获取AI服务状态'
      };
    }
  }

  /**
   * 手动触发数据处理
   */
  async triggerDataProcessing(): Promise<AIServiceResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/data/process`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('触发数据处理失败:', error);
      return {
        success: false,
        message: '无法启动数据处理任务'
      };
    }
  }

  /**
   * 生成对话ID
   */
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * 将AI响应转换为消息格式
   */
  convertToMessage(response: AIResponse): AIMessage {
    return {
      id: response.id || Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(response.timestamp || Date.now()),
      sources: response.sources,
      intent: response.intent
    };
  }

  /**
   * 处理API错误
   */
  private handleApiError(error: any): AIServiceResponse {
    console.error('API错误:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: '网络连接错误，请检查网络连接'
      };
    }
    
    if (error.status === 401) {
      return {
        success: false,
        message: '认证失败，请重新登录'
      };
    }
    
    if (error.status === 429) {
      return {
        success: false,
        message: '请求过于频繁，请稍后再试'
      };
    }
    
    if (error.status >= 500) {
      return {
        success: false,
        message: '服务器错误，请稍后再试'
      };
    }
    
    return {
      success: false,
      message: error.message || '未知错误'
    };
  }
}

export default AIService; 