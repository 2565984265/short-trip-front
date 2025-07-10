'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ClientOnly from '@/components/common/ClientOnly';

// 模拟数据
const mockPosts = [
  {
    id: '1',
    author: {
      id: '1',
      name: '旅行达人小王',
      avatar: '/avatars/user1.jpg',
      isCreator: true,
      followers: 1234,
    },
    content: '刚刚完成了张家界三日游，分享一些实用攻略！玻璃栈道真的很刺激，建议恐高的小伙伴慎重考虑。',
    images: ['/avatars/user1.jpg'],
    likes: 89,
    comments: 23,
    shares: 12,
    createdAt: '2024-01-20 14:30',
    tags: ['张家界', '玻璃栈道', '攻略分享'],
  },
  {
    id: '2',
    author: {
      id: '2',
      name: '骑行爱好者',
      avatar: '/avatars/user2.jpg',
      isCreator: true,
      followers: 856,
    },
    content: '川藏线骑行第15天，今天翻越了折多山，海拔4298米。虽然很累，但看到的美景绝对值得！',
    images: ['/avatars/user2.jpg'],
    likes: 156,
    comments: 45,
    shares: 28,
    createdAt: '2024-01-19 18:20',
    tags: ['川藏线', '骑行', '高原'],
  },
  {
    id: '3',
    author: {
      id: '3',
      name: '户外探索者',
      avatar: '/avatars/user3.jpg',
      isCreator: false,
      followers: 234,
    },
    content: '莫干山徒步一日游，竹林小径真的很美，空气清新，适合周末放松。推荐大家来体验！',
    images: ['/avatars/user3.jpg'],
    likes: 67,
    comments: 15,
    shares: 8,
    createdAt: '2024-01-18 16:45',
    tags: ['莫干山', '徒步', '一日游'],
  },
];

const mockCreators = [
  {
    id: '1',
    name: '旅行达人小王',
    avatar: '/avatars/user1.jpg',
    bio: '专业旅行规划师，去过30+个国家，擅长制定个性化旅行方案',
    followers: 1234,
    posts: 89,
    guides: 12,
    tags: ['旅行规划', '摄影', '美食'],
  },
  {
    id: '2',
    name: '骑行爱好者',
    avatar: '/avatars/user2.jpg',
    bio: '资深骑行爱好者，完成过川藏线、青藏线等多条经典路线',
    followers: 856,
    posts: 156,
    guides: 8,
    tags: ['骑行', '户外', '探险'],
  },
  {
    id: '3',
    name: '户外探索者',
    avatar: '/avatars/user3.jpg',
    bio: '热爱户外运动，专注于短途徒步和露营攻略分享',
    followers: 234,
    posts: 67,
    guides: 5,
    tags: ['徒步', '露营', '户外'],
  },
];

const mockTrendingTopics = [
  { name: '张家界', count: 1234 },
  { name: '川藏线', count: 856 },
  { name: '莫干山', count: 567 },
  { name: '玻璃栈道', count: 432 },
  { name: '徒步', count: 345 },
  { name: '骑行', count: 234 },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'creators' | 'trending'>('posts');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">旅行社区</h1>
          <p className="text-gray-600">分享你的旅行故事，发现精彩内容</p>
        </div>

        {/* 标签页 */}
        <div className="flex space-x-8 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            社区动态
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'creators'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            创作者
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            热门话题
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主要内容区域 */}
          <div className="lg:w-2/3">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {mockPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
                                         {/* 作者信息 */}
                     <div className="flex items-center mb-4">
                       <div className="relative w-12 h-12 mr-4">
                         <ClientOnly>
                           <img
                             src={post.author.avatar}
                             alt={post.author.name}
                             className="w-12 h-12 rounded-full object-cover"
                           />
                         </ClientOnly>
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center">
                           <Link href="/profile" className="font-semibold text-gray-900 hover:text-blue-600">
                             {post.author.name}
                           </Link>
                           {post.author.isCreator && (
                             <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                               创作者
                             </span>
                           )}
                         </div>
                         <p className="text-sm text-gray-500">
                           {post.author.followers} 粉丝 · {post.createdAt}
                         </p>
                       </div>
                     </div>

                    {/* 内容 */}
                    <p className="text-gray-900 mb-4">{post.content}</p>

                    {/* 图片 */}
                    {post.images.length > 0 && (
                      <ClientOnly>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`动态图片 ${index + 1}`}
                              className="aspect-video object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </ClientOnly>
                    )}

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 互动按钮 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500">
                          <span>❤️</span>
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                          <span>💬</span>
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                          <span>📤</span>
                          <span>{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'creators' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockCreators.map((creator) => (
                  <div key={creator.id} className="bg-white rounded-lg shadow-sm p-6">
                                         <div className="flex items-center mb-4">
                       <div className="relative w-16 h-16 mr-4">
                         <img
                           src={creator.avatar}
                           alt={creator.name}
                           className="w-16 h-16 rounded-full object-cover"
                         />
                       </div>
                       <div className="flex-1">
                         <Link href="/profile" className="font-semibold text-gray-900 hover:text-blue-600">
                           {creator.name}
                         </Link>
                         <p className="text-sm text-gray-500">{creator.followers} 粉丝</p>
                       </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        关注
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{creator.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {creator.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{creator.posts} 动态</span>
                      <span>{creator.guides} 攻略</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trending' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">热门话题</h3>
                <div className="space-y-4">
                  {mockTrendingTopics.map((topic, index) => (
                    <div key={topic.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-4">#{index + 1}</span>
                        <span className="font-medium text-gray-900">#{topic.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{topic.count} 讨论</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="lg:w-1/3">
            {/* 发布动态 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">分享你的旅行</h3>
              <textarea
                placeholder="分享你的旅行故事..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-500">
                    📷
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-500">
                    📍
                  </button>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  发布
                </button>
              </div>
            </div>

            {/* 推荐关注 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">推荐关注</h3>
              <div className="space-y-4">
                {mockCreators.slice(0, 3).map((creator) => (
                                     <div key={creator.id} className="flex items-center">
                     <div className="relative w-10 h-10 mr-3">
                       <img
                         src={creator.avatar}
                         alt={creator.name}
                         className="w-10 h-10 rounded-full object-cover"
                       />
                     </div>
                     <div className="flex-1">
                       <Link href="/profile" className="font-medium text-gray-900 hover:text-blue-600">
                         {creator.name}
                       </Link>
                       <p className="text-sm text-gray-500">{creator.followers} 粉丝</p>
                     </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      关注
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 