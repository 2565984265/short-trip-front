'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';

interface UserContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserStats: (stats: Partial<Pick<User, 'guideCount' | 'postCount' | 'followerCount' | 'followingCount'>>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 验证token有效性并获取最新用户信息
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      console.log('Validating token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Token validation response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Token validation response data:', data);
        
        if (data.code === 0 && data.data) {
          // 更新用户信息
          setUser(data.data);
          console.log('Token validation successful, user updated:', data.data);
          return true;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token validation failed with status:', response.status, 'error:', errorData);
      }
      return false;
    } catch (error) {
      console.error('Token validation failed with exception:', error);
      return false;
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) {
      console.log('No token available for refresh');
      return;
    }

    try {
      console.log('Refreshing user info...');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0 && data.data) {
          setUser(data.data);
          // 更新本地存储
          localStorage.setItem('user', JSON.stringify(data.data));
          console.log('User info refreshed successfully:', data.data);
        }
      } else {
        console.error('Failed to refresh user info:', response.status);
      }
    } catch (error) {
      console.error('Error refreshing user info:', error);
    }
  };

  // 更新用户统计信息
  const updateUserStats = (stats: Partial<Pick<User, 'guideCount' | 'postCount' | 'followerCount' | 'followingCount'>>) => {
    if (user) {
      const updatedUser = { ...user, ...stats };
      setUser(updatedUser);
      // 更新本地存储
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User stats updated:', stats);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // 从localStorage恢复用户状态
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken) {
          console.log('Found saved token, setting auth state...');
          
          // 暂时跳过token验证，直接使用localStorage中的数据
            setToken(savedToken);
            setIsAuthenticated(true);
          
          // 如果localStorage有用户数据，也恢复它
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
              console.log('User data restored from localStorage');
            } catch (error) {
              console.error('Failed to parse saved user data:', error);
            }
          }
          
          console.log('Auth initialization successful (skipped validation)');
        } else {
          console.log('No saved token found');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('Auth initialization completed, loading:', false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, userToken: string) => {
    console.log('UserContext login called with:', userData, userToken);
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('UserContext login completed, isAuthenticated should be true');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      refreshUser,
      updateUserStats,
      isAuthenticated, 
      loading 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}