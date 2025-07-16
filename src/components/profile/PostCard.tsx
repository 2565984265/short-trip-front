'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Post {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  content: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  location?: string;
  tags?: string[];
  createTime: string;
  isLiked?: boolean;
  isOwned?: boolean;
}

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
  onLike?: (postId: number) => void;
  onUnlike?: (postId: number) => void;
}

export default function PostCard({ post, onEdit, onDelete, onLike, onUnlike }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
      onUnlike?.(post.id);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      onLike?.(post.id);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: zhCN 
      });
    } catch {
      return '刚刚';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* 用户信息 */}
      <div className="flex items-center mb-3">
        <div className="relative w-10 h-10 mr-3">
          <Image
            src={post.userAvatar || '/avatars/user1.jpg'}
            alt={post.userNickname}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{post.userNickname}</div>
          <div className="text-sm text-gray-500">
            {formatTime(post.createTime)}
            {post.location && (
              <span className="ml-2">📍 {post.location}</span>
            )}
          </div>
        </div>
        
        {/* 操作按钮 */}
        {post.isOwned && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(post)}
              className="text-gray-500 hover:text-blue-600 text-sm"
            >
              编辑
            </button>
            <button
              onClick={() => onDelete?.(post.id)}
              className="text-gray-500 hover:text-red-600 text-sm"
            >
              删除
            </button>
          </div>
        )}
      </div>

      {/* 动态内容 */}
      <div className="mb-3">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* 图片 */}
      {post.images && post.images.length > 0 && (
        <div className="mb-3">
          {post.images.length === 1 ? (
            <div className="relative w-full h-64">
              <Image
                src={post.images[0]}
                alt="动态图片"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`动态图片 ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 标签 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 互动统计 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center space-x-1">
            <span>💬</span>
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>👁️</span>
            <span>{post.viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 