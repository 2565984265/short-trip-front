'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ClientOnly from '@/components/common/ClientOnly';

// 模拟数据
const mockApplication = {
  id: '1',
  userId: '1',
  user: {
    id: '1',
    name: '旅行达人小王',
    avatar: '/avatars/user1.jpg',
    bio: '热爱旅行，喜欢分享',
    isCreator: false,
    followers: 1234,
    following: 567,
    posts: 89,
    guides: 0,
    createdAt: '2023-06-15',
    tags: ['旅行', '摄影', '美食'],
  },
  reason: '我是一名专业的旅行规划师，有丰富的旅行经验和专业知识。我希望通过创作者身份，为更多旅行者提供优质的攻略和建议。',
  portfolio: {
    guides: [],
    posts: ['post1', 'post2', 'post3'],
    socialLinks: [
      'https://weibo.com/traveler123',
      'https://www.xiaohongshu.com/user/123456',
    ],
  },
  status: 'pending' as const,
  submittedAt: '2024-01-15',
  reviewedAt: undefined,
  reviewerNote: undefined,
};

export default function CreatorApplyPage() {
  const [application, setApplication] = useState(mockApplication);
  const [reason, setReason] = useState(application.reason);
  const [socialLinks, setSocialLinks] = useState(application.portfolio.socialLinks);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模拟提交
    setTimeout(() => {
      setApplication({
        ...application,
        reason,
        portfolio: {
          ...application.portfolio,
          socialLinks,
        },
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      case 'pending':
        return '审核中';
      default:
        return '未知状态';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link 
          href="/community" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回社区
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">创作者申请</h1>
          <p className="text-gray-600">成为创作者，分享你的旅行故事和专业知识</p>
        </div>

        {/* 申请状态 */}
        {application.status !== 'pending' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">申请状态</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">提交时间</p>
                <p className="text-sm text-gray-900">
                  <ClientOnly>
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </ClientOnly>
                </p>
              </div>
            </div>
            
            {application.reviewerNote && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">审核意见</h4>
                <p className="text-gray-600">{application.reviewerNote}</p>
              </div>
            )}
          </div>
        )}

        {/* 申请表单 */}
        {application.status === 'pending' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">申请信息</h3>
            
            {/* 个人简介 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                申请理由 *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请详细说明你为什么想成为创作者，你的专业背景、旅行经验等..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                请详细描述你的旅行经验、专业知识和创作计划
              </p>
            </div>

            {/* 社交媒体链接 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                社交媒体链接
              </label>
              <div className="space-y-3">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...socialLinks];
                        newLinks[index] = e.target.value;
                        setSocialLinks(newLinks);
                      }}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = socialLinks.filter((_, i) => i !== index);
                        setSocialLinks(newLinks);
                      }}
                      className="ml-2 px-3 py-3 text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSocialLinks([...socialLinks, ''])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + 添加链接
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                添加你的微博、小红书、抖音等社交媒体链接，展示你的内容创作能力
              </p>
            </div>

            {/* 创作者权益说明 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">创作者权益</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 获得创作者认证标识</li>
                <li>• 优先展示你的攻略和动态</li>
                <li>• 参与平台活动和合作机会</li>
                <li>• 获得更多曝光和粉丝增长</li>
                <li>• 专属创作者工具和数据分析</li>
              </ul>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        )}

        {/* 申请指南 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">申请指南</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">申请条件</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 有丰富的旅行经验</li>
                <li>• 具备内容创作能力</li>
                <li>• 愿意分享旅行知识</li>
                <li>• 遵守平台规则</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">审核流程</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 提交申请材料</li>
                <li>• 平台审核（3-5个工作日）</li>
                <li>• 审核结果通知</li>
                <li>• 通过后获得创作者权限</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 