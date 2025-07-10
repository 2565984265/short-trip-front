'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Guide } from '@/types/guide';

interface GuideCardProps {
  guide: Guide;
}

const transportationIcons = {
  walking: '🚶',
  cycling: '🚴',
  motorcycle: '🏍️',
  car: '🚗',
  rv: '🚐',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/guides/${guide.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        {/* 封面图片 */}
        <div className="relative h-48 bg-gray-200">
          {guide.media.coverImage ? (
            <Image
              src={guide.media.coverImage}
              alt={guide.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-4xl">🏔️</span>
            </div>
          )}
          
          {/* 标签 */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[guide.route.difficulty]}`}>
              {guide.route.difficulty === 'easy' ? '简单' : 
               guide.route.difficulty === 'medium' ? '中等' : '困难'}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {transportationIcons[guide.route.transportation]}
              {guide.route.transportation === 'walking' ? '徒步' :
               guide.route.transportation === 'cycling' ? '骑行' :
               guide.route.transportation === 'motorcycle' ? '摩托' :
               guide.route.transportation === 'car' ? '自驾' : '房车'}
            </span>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {guide.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {guide.description}
          </p>

          {/* 路线信息 */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="mr-4">
              📍 {guide.route.startLocation} → {guide.route.endLocation}
            </span>
            <span className="mr-4">
              📏 {guide.route.totalDistance}km
            </span>
            <span>
              ⏱️ {guide.route.estimatedTime}h
            </span>
          </div>

          {/* 作者和统计信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {guide.author.avatar ? (
                <Image
                  src={guide.author.avatar}
                  alt={guide.author.name}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {guide.author.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                {guide.author.name}
              </span>
              {guide.author.isCreator && (
                <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-1 rounded">
                  创作者
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>⭐ {guide.rating.toFixed(1)}</span>
              <span>👁️ {guide.viewCount}</span>
              <span>❤️ {guide.likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 