'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Guide } from '@/types/guide';
import CommunityWidget from '@/components/community/CommunityWidget';
import ClientOnly from '@/components/common/ClientOnly';

// 模拟数据 - 实际项目中应该从API获取
const mockGuide: Guide = {
  id: '1',
  title: '张家界三日游完美攻略',
  description: '探索张家界国家森林公园的绝美风景，体验玻璃栈道的惊险刺激，感受天门山的壮丽景色。这是一条适合家庭出游的经典路线，既有惊险刺激的体验，也有轻松惬意的观光。',
  author: {
    id: '1',
    name: '旅行达人小王',
    avatar: '/avatars/user1.jpg',
    isCreator: true,
  },
  route: {
    startLocation: '张家界市区',
    endLocation: '张家界市区',
    waypoints: [
      {
        id: '1',
        name: '张家界国家森林公园',
        type: 'scenic',
        coordinates: { lat: 29.3271, lng: 110.4792 },
        description: '世界自然遗产，以奇特的石柱群闻名',
        estimatedTime: 240,
      },
      {
        id: '2',
        name: '天门山',
        type: 'scenic',
        coordinates: { lat: 29.0556, lng: 110.4792 },
        description: '天门山玻璃栈道，挑战你的勇气',
        estimatedTime: 180,
      },
      {
        id: '3',
        name: '黄龙洞',
        type: 'scenic',
        coordinates: { lat: 29.3271, lng: 110.4792 },
        description: '亚洲最大的溶洞之一',
        estimatedTime: 120,
      },
    ],
    totalDistance: 120,
    estimatedTime: 72,
    difficulty: 'medium',
    transportation: 'car',
  },
  content: {
    overview: '张家界三日游是一次完美的自然探索之旅。第一天游览张家界国家森林公园，感受大自然的鬼斧神工；第二天挑战天门山玻璃栈道，体验惊险刺激；第三天探访黄龙洞，了解地质奇观。',
    highlights: ['玻璃栈道', '天门山', '黄龙洞', '袁家界', '金鞭溪'],
    itinerary: [
      {
        day: 1,
        title: '张家界国家森林公园',
        description: '游览袁家界、金鞭溪等核心景区',
        waypoints: ['1'],
        estimatedTime: 8,
        accommodation: '张家界市区酒店',
        meals: ['早餐：酒店', '午餐：景区内', '晚餐：市区特色餐厅'],
      },
      {
        day: 2,
        title: '天门山一日游',
        description: '体验玻璃栈道，乘坐世界最长索道',
        waypoints: ['2'],
        estimatedTime: 6,
        accommodation: '张家界市区酒店',
        meals: ['早餐：酒店', '午餐：天门山餐厅', '晚餐：市区美食'],
      },
      {
        day: 3,
        title: '黄龙洞探秘',
        description: '探索亚洲最大溶洞，感受地下奇观',
        waypoints: ['3'],
        estimatedTime: 4,
        accommodation: '返程',
        meals: ['早餐：酒店', '午餐：黄龙洞附近'],
      },
    ],
    tips: [
      '建议提前预订门票，旺季需要提前3-7天',
      '准备雨具，张家界多雨',
      '穿舒适的运动鞋，景区内步行距离较长',
      '带足饮用水和零食',
      '注意防晒，景区内遮阳设施有限',
    ],
    equipment: [
      {
        category: 'clothing',
        name: '舒适运动鞋',
        description: '防滑、透气、舒适的运动鞋',
        isRequired: true,
        price: 200,
      },
      {
        category: 'gear',
        name: '雨衣或雨伞',
        description: '防雨装备，张家界多雨',
        isRequired: true,
        price: 30,
      },
      {
        category: 'electronics',
        name: '相机',
        description: '记录美好瞬间',
        isRequired: false,
        price: 3000,
      },
      {
        category: 'safety',
        name: '急救包',
        description: '基础医疗用品',
        isRequired: false,
        price: 50,
      },
    ],
    warnings: [
      '玻璃栈道有恐高症者慎入',
      '景区内注意安全，不要攀爬危险区域',
      '雨季路滑，注意防滑',
      '高原反应风险较低，但也要注意',
    ],
  },
  media: {
    coverImage: '/images/zhangjiajie.jpg',
    images: [
      '/images/zhangjiajie1.jpg',
      '/images/zhangjiajie2.jpg',
      '/images/zhangjiajie3.jpg',
    ],
    videos: [
      {
        platform: 'douyin',
        url: 'https://www.douyin.com/video/123456',
        title: '张家界玻璃栈道体验',
        description: '第一视角体验玻璃栈道',
        thumbnail: '/images/zhangjiajie1.jpg',
      },
    ],
  },
  tags: ['张家界', '三日游', '玻璃栈道', '自然风光', '家庭游'],
  rating: 4.8,
  reviewCount: 156,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15',
  isPublished: true,
  viewCount: 2340,
  likeCount: 189,
  bookmarkCount: 67,
};

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

export default function GuideDetailPage() {
  const params = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'tips' | 'equipment'>('overview');

  useEffect(() => {
    // 模拟API调用
    setGuide(mockGuide);
  }, [params.id]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link 
          href="/guides" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回攻略列表
        </Link>

        {/* 攻略头部信息 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* 封面图片 */}
          <div className="relative h-64 md:h-80 bg-gray-200">
            {guide.media.coverImage ? (
              <Image
                src={guide.media.coverImage}
                alt={guide.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-6xl">🏔️</span>
              </div>
            )}
          </div>

          {/* 攻略信息 */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{guide.title}</h1>
                <p className="text-gray-600 text-lg">{guide.description}</p>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center space-x-3 ml-6">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  收藏
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  分享
                </button>
              </div>
            </div>

            {/* 路线基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{guide.route.totalDistance}km</div>
                <div className="text-sm text-gray-600">总距离</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{guide.route.estimatedTime}h</div>
                <div className="text-sm text-gray-600">预计时长</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{guide.route.waypoints.length}</div>
                <div className="text-sm text-gray-600">途经点</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">⭐ {guide.rating}</div>
                <div className="text-sm text-gray-600">评分</div>
              </div>
            </div>

            {/* 标签 */}
            <div className="flex items-center space-x-4 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm ${difficultyColors[guide.route.difficulty]}`}>
                {guide.route.difficulty === 'easy' ? '简单' : 
                 guide.route.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {transportationIcons[guide.route.transportation]}
                {guide.route.transportation === 'walking' ? '徒步' :
                 guide.route.transportation === 'cycling' ? '骑行' :
                 guide.route.transportation === 'motorcycle' ? '摩托' :
                 guide.route.transportation === 'car' ? '自驾' : '房车'}
              </span>
              {guide.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* 作者信息 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center">
                {guide.author.avatar ? (
                  <Image
                    src={guide.author.avatar}
                    alt={guide.author.name}
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-sm text-gray-600">
                      {guide.author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <Link href="/profile" className="font-medium text-gray-900 hover:text-blue-600">
                    {guide.author.name}
                  </Link>
                  <div className="text-sm text-gray-600">
                    <ClientOnly>
                  {new Date(guide.createdAt).toLocaleDateString('zh-CN')}
                </ClientOnly> 发布
                    {guide.author.isCreator && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        创作者
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>👁️ {guide.viewCount}</span>
                <span>❤️ {guide.likeCount}</span>
                <span>📚 {guide.bookmarkCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 内容标签页 */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          {/* 标签页导航 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: '概览', icon: '📋' },
                { id: 'itinerary', label: '行程安排', icon: '🗓️' },
                { id: 'tips', label: '实用贴士', icon: '💡' },
                { id: 'equipment', label: '装备清单', icon: '🎒' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 标签页内容 */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">路线概览</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">{guide.content.overview}</p>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-3">亮点景点</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {guide.content.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-yellow-500 mr-3">⭐</span>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">途经点</h4>
                <div className="space-y-3">
                  {guide.route.waypoints.map((waypoint) => (
                    <div key={waypoint.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{waypoint.name}</div>
                        <div className="text-sm text-gray-600">{waypoint.description}</div>
                      </div>
                      <div className="text-sm text-gray-500">{waypoint.estimatedTime}分钟</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">详细行程</h3>
                <div className="space-y-6">
                  {guide.content.itinerary.map((day) => (
                    <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {day.day}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{day.title}</h4>
                      </div>
                      <p className="text-gray-700 mb-3">{day.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">预计时长：</span>
                          <span className="text-gray-600">{day.estimatedTime}小时</span>
                        </div>
                        {day.accommodation && (
                          <div>
                            <span className="font-medium text-gray-900">住宿：</span>
                            <span className="text-gray-600">{day.accommodation}</span>
                          </div>
                        )}
                      </div>
                      
                      {day.meals && day.meals.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-900">用餐安排：</span>
                          <div className="mt-1 space-y-1">
                            {day.meals.map((meal, index) => (
                              <div key={index} className="text-sm text-gray-600">• {meal}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">实用贴士</h3>
                <div className="space-y-4 mb-6">
                  {guide.content.tips.map((tip, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-500 mr-3 mt-1">💡</span>
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">注意事项</h4>
                <div className="space-y-3">
                  {guide.content.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start p-3 bg-red-50 rounded-lg">
                      <span className="text-red-500 mr-3 mt-1">⚠️</span>
                      <span className="text-gray-700">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">装备清单</h3>
                <div className="space-y-4">
                  {guide.content.equipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.isRequired && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            必需
                          </span>
                        )}
                        {item.price && (
                          <span className="text-sm text-gray-600">¥{item.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 社区动态 */}
        <CommunityWidget guideId={guide.id} tags={guide.tags} />

        {/* 相关推荐 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">相关推荐</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 这里可以添加相关攻略推荐 */}
            <div className="text-center py-8 text-gray-500">
              更多相关攻略开发中...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 