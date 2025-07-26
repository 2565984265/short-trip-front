'use client';

import React from 'react';
import Link from 'next/link';

interface CommunityWidgetProps {
  guideId: string;
  tags: string[];
}

// 模拟数据
const mockRelatedPosts = [
  {
    id: '1',
    author: '旅行达人小王',
    content: '刚刚完成了张家界三日游，分享一些实用指南！',
    likes: 89,
    comments: 23,
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    author: '户外探索者',
    content: '张家界的玻璃栈道真的很刺激，建议恐高的小伙伴慎重考虑。',
    likes: 67,
    comments: 15,
    createdAt: '2024-01-19',
  },
];

const mockRelatedCreators = [
  {
    id: '1',
    name: '旅行达人小王',
    followers: 1234,
    guides: 12,
    tags: ['张家界', '摄影', '美食'],
  },
  {
    id: '2',
    name: '户外探索者',
    followers: 856,
    guides: 8,
    tags: ['徒步', '露营', '户外'],
  },
];

export default function CommunityWidget({ guideId, tags }: CommunityWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">社区动态</h3>
      
      {/* 相关动态 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">相关讨论</h4>
        <div className="space-y-3">
          {mockRelatedPosts.map((post) => (
            <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{post.author}</span>
                <span className="text-sm text-gray-500">{post.createdAt}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{post.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
        <Link 
          href="/community" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          查看更多 →
        </Link>
      </div>

      {/* 相关创作者 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">相关创作者</h4>
        <div className="space-y-3">
          {mockRelatedCreators.map((creator) => (
            <div key={creator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">{creator.name}</h5>
                <p className="text-sm text-gray-500">{creator.followers} 粉丝 · {creator.guides} 指南</p>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                关注
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 分享到社区 */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">分享你的体验</h4>
        <p className="text-sm text-gray-600 mb-3">
          去过这里？分享你的旅行故事和照片，帮助其他旅行者！
        </p>
        <Link 
          href="/community" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          发布动态
        </Link>
      </div>
    </div>
  );
} 