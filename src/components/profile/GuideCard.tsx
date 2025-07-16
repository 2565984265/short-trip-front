'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Guide {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  title: string;
  summary: string;
  coverImage: string;
  difficultyLevel: string;
  difficultyLevelDisplay: string;
  destination: string;
  estimatedTime: string;
  estimatedCost: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  rating: number;
  ratingCount: number;
  createTime: string;
  isOwned?: boolean;
}

interface GuideCardProps {
  guide: Guide;
  onEdit?: (guide: Guide) => void;
  onDelete?: (guideId: number) => void;
  onLike?: (guideId: number) => void;
  onFavorite?: (guideId: number) => void;
}

export default function GuideCard({ guide, onEdit, onDelete, onLike, onFavorite }: GuideCardProps) {
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

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DIFFICULT':
        return 'bg-orange-100 text-orange-800';
      case 'EXPERT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 封面图片 */}
      <div className="relative h-48">
        <Image
          src={guide.coverImage || '/images/placeholder.jpg'}
          alt={guide.title}
          fill
          className="object-cover"
        />
        {guide.isOwned && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={() => onEdit?.(guide)}
              className="bg-white bg-opacity-80 p-1 rounded text-gray-600 hover:text-blue-600"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete?.(guide.id)}
              className="bg-white bg-opacity-80 p-1 rounded text-gray-600 hover:text-red-600"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-4">
        {/* 标题和作者 */}
        <div className="mb-2">
          <Link href={`/guides/${guide.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {guide.title}
            </h3>
          </Link>
          <div className="flex items-center mt-1">
            <div className="relative w-6 h-6 mr-2">
              <Image
                src={guide.userAvatar || '/avatars/user1.jpg'}
                alt={guide.userNickname}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <span className="text-sm text-gray-600">{guide.userNickname}</span>
          </div>
        </div>

        {/* 摘要 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {guide.summary}
        </p>

        {/* 标签和难度 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">📍 {guide.destination}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(guide.difficultyLevel)}`}>
              {guide.difficultyLevelDisplay}
            </span>
          </div>
          <span className="text-sm text-gray-500">⏱️ {guide.estimatedTime}</span>
        </div>

        {/* 费用 */}
        {guide.estimatedCost && (
          <div className="text-sm text-gray-500 mb-3">
            💰 {guide.estimatedCost}
          </div>
        )}

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span>⭐</span>
              <span>{guide.rating.toFixed(1)}</span>
              <span className="text-xs">({guide.ratingCount})</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>👁️</span>
              <span>{guide.viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>❤️</span>
              <span>{guide.likeCount}</span>
            </div>
          </div>
          <span className="text-xs">{formatTime(guide.createTime)}</span>
        </div>
      </div>
    </div>
  );
} 