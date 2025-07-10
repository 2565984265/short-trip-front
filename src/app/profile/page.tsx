'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ClientOnly from '@/components/common/ClientOnly';

// 模拟用户数据
const mockUser = {
  id: '1',
  name: '旅行达人小王',
  avatar: '/avatars/user1.jpg',
  bio: '专业旅行规划师，去过30+个国家，擅长制定个性化旅行方案。热爱摄影，喜欢记录旅途中的美好瞬间。',
  isCreator: true,
  followers: 1234,
  following: 567,
  posts: 89,
  guides: 12,
  createdAt: '2023-06-15',
  tags: ['旅行规划', '摄影', '美食', '户外'],
  location: '北京',
  website: 'https://traveler.com',
  socialLinks: {
    weibo: 'https://weibo.com/traveler123',
    wechat: 'traveler123',
    douyin: 'https://www.douyin.com/user/123456',
    xiaohongshu: 'https://www.xiaohongshu.com/user/123456',
  },
};

const mockPosts = [
  {
    id: '1',
    content: '刚刚完成了张家界三日游，分享一些实用攻略！玻璃栈道真的很刺激，建议恐高的小伙伴慎重考虑。',
    images: ['/images/zhangjiajie1.jpg'],
    likes: 89,
    comments: 23,
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    content: '川藏线骑行第15天，今天翻越了折多山，海拔4298米。虽然很累，但看到的美景绝对值得！',
    images: ['/images/tibet1.jpg'],
    likes: 156,
    comments: 45,
    createdAt: '2024-01-19',
  },
];

const mockGuides = [
  {
    id: '1',
    title: '张家界三日游完美攻略',
    coverImage: '/images/zhangjiajie.jpg',
    rating: 4.8,
    viewCount: 2340,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: '川藏线骑行攻略',
    coverImage: '/images/tibet.jpg',
    rating: 4.9,
    viewCount: 1890,
    createdAt: '2024-01-10',
  },
];

export default function ProfilePage() {
  const [user] = useState(mockUser);
  const [activeTab, setActiveTab] = useState<'posts' | 'guides' | 'about'>('posts');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 个人资料卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            {/* 头像 */}
            <div className="relative w-24 h-24 mr-6 mb-4 md:mb-0">
              <ClientOnly>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </ClientOnly>
            </div>

            {/* 基本信息 */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">{user.name}</h1>
                {user.isCreator && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    创作者
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{user.bio}</p>
              
              {/* 统计信息 */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <span>{user.followers} 粉丝</span>
                <span>{user.following} 关注</span>
                <span>{user.posts} 动态</span>
                <span>{user.guides} 攻略</span>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {user.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                编辑资料
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                分享
              </button>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* 标签页导航 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                动态 ({user.posts})
              </button>
              <button
                onClick={() => setActiveTab('guides')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guides'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                攻略 ({user.guides})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                关于
              </button>
            </nav>
          </div>

          {/* 标签页内容 */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {mockPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 mb-3">{post.content}</p>
                    
                    {post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {post.images.map((image, index) => (
                          <ClientOnly key={index}>
                            <img
                              src={image}
                              alt={`动态图片 ${index + 1}`}
                              className="aspect-video object-cover rounded-lg"
                            />
                          </ClientOnly>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.createdAt}</span>
                      <div className="flex items-center space-x-4">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockGuides.map((guide) => (
                  <div key={guide.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">封面图片</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>⭐ {guide.rating}</span>
                        <span>👁️ {guide.viewCount}</span>
                        <span>{guide.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">基本信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">位置：</span>
                      <span className="text-gray-600">{user.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">加入时间：</span>
                      <span className="text-gray-600">
                        <ClientOnly>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </ClientOnly>
                      </span>
                    </div>
                    {user.website && (
                      <div>
                        <span className="font-medium text-gray-900">网站：</span>
                        <a href={user.website} className="text-blue-600 hover:text-blue-800">
                          {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">社交媒体</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.socialLinks.weibo && (
                      <div>
                        <span className="font-medium text-gray-900">微博：</span>
                        <a href={user.socialLinks.weibo} className="text-blue-600 hover:text-blue-800">
                          @traveler123
                        </a>
                      </div>
                    )}
                    {user.socialLinks.wechat && (
                      <div>
                        <span className="font-medium text-gray-900">微信：</span>
                        <span className="text-gray-600">{user.socialLinks.wechat}</span>
                      </div>
                    )}
                    {user.socialLinks.douyin && (
                      <div>
                        <span className="font-medium text-gray-900">抖音：</span>
                        <a href={user.socialLinks.douyin} className="text-blue-600 hover:text-blue-800">
                          旅行达人小王
                        </a>
                      </div>
                    )}
                    {user.socialLinks.xiaohongshu && (
                      <div>
                        <span className="font-medium text-gray-900">小红书：</span>
                        <a href={user.socialLinks.xiaohongshu} className="text-blue-600 hover:text-blue-800">
                          旅行达人小王
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 