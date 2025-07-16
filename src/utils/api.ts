import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登录失败');
  }

  const apiResponse = await response.json();
  
  // 检查API响应格式
  if (apiResponse.code !== 0) {
    throw new Error(apiResponse.message || '登录失败');
  }
  
  return apiResponse.data;
}

export async function register(userData: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '注册失败');
  }

  const apiResponse = await response.json();
  
  // 检查API响应格式
  if (apiResponse.code !== 0) {
    throw new Error(apiResponse.message || '注册失败');
  }
  
  return apiResponse.data;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
} 