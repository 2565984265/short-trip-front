'use client';

import React, { useState, useEffect } from 'react';
import { Guide } from '@/types/guide';

interface GuideEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guideData: any) => void;
  guide?: Guide | null;
  title: string;
}

export default function GuideEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  guide, 
  title 
}: GuideEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    destination: '',
    difficultyLevel: 'EASY',
    estimatedTime: '',
    estimatedCost: '',
    season: '四季皆宜',
    transportMode: '自驾',
    tags: '',
    coverImage: '',
    isFeatured: false,
    isPublished: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guide) {
      setFormData({
        title: guide.title || '',
        summary: guide.summary || '',
        content: guide.content || '',
        destination: guide.destination || '',
        difficultyLevel: guide.difficultyLevel || 'EASY',
        estimatedTime: guide.estimatedTime || '',
        estimatedCost: guide.estimatedCost || '',
        season: guide.season || '四季皆宜',
        transportMode: guide.transportMode || '自驾',
        tags: guide.tags ? guide.tags.join(', ') : '',
        coverImage: guide.coverImage || '',
        isFeatured: guide.isFeatured || false,
        isPublished: guide.isPublished !== false
      });
    } else {
      setFormData({
        title: '',
        summary: '',
        content: '',
        destination: '',
        difficultyLevel: 'EASY',
        estimatedTime: '',
        estimatedCost: '',
        season: '四季皆宜',
        transportMode: '自驾',
        tags: '',
        coverImage: '',
        isFeatured: false,
        isPublished: true
      });
    }
  }, [guide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const guideData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await onSave(guideData);
      onClose();
    } catch (error) {
      console.error('保存攻略失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                攻略标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入攻略标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目的地 *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入目的地"
              />
            </div>
          </div>

          {/* 摘要 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              攻略摘要 *
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入攻略摘要"
            />
          </div>

          {/* 详细内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细内容 *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入详细的攻略内容"
            />
          </div>

          {/* 参数设置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                难度等级
              </label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EASY">简单</option>
                <option value="MODERATE">中等</option>
                <option value="DIFFICULT">困难</option>
                <option value="EXPERT">专家</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预计时间
              </label>
              <input
                type="text"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：3天2夜"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预计费用
              </label>
              <input
                type="text"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：2000-3000元"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                适宜季节
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="春季">春季</option>
                <option value="夏季">夏季</option>
                <option value="秋季">秋季</option>
                <option value="冬季">冬季</option>
                <option value="四季皆宜">四季皆宜</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交通方式
              </label>
              <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="自驾">自驾</option>
                <option value="飞机">飞机</option>
                <option value="高铁">高铁</option>
                <option value="公交">公交</option>
                <option value="步行">步行</option>
                <option value="包车">包车</option>
              </select>
            </div>
          </div>

          {/* 标签和封面 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="用逗号分隔，如：美食,风景,摄影"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片URL
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入图片URL"
              />
            </div>
          </div>

          {/* 发布设置 */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">立即发布</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">设为精选</span>
            </label>
          </div>

          {/* 按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 