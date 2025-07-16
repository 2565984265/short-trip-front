export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  role: string;
  roleDisplay?: string;
  status?: string;
  statusDisplay?: string;
  bio?: string;
  location?: string;
  isCreator?: boolean;
  isVerified?: boolean;
  guideCount?: number;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
  likeCount?: number;
  rating?: number;
  ratingCount?: number;
  lastLoginIp?: string;
  lastLoginTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
  message?: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
} 