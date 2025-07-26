'use client';

import React, { useState, useEffect } from 'react';
import { kmlAPI } from '../../services/kml';

interface KMLEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  kmlFile: KMLFile | null;
}

interface KMLFile {
  id: number;
  fileName: string;
  fileSize: number;
  documentName: string;
  routeName: string;
  trackPointCount: number;
  placemarkCount: number;
  totalDistance: number;
  maxAltitude: number;
  minAltitude: number;
  travelMode: string;
  tags: string;
  creatorName: string;
  uploadTime: string;
  remarks: string;
  isPublic: boolean;
  isRecommended: boolean;
  rating: number;
  viewCount: number;
  favoriteCount: number;
}

const KMLEditModal: React.FC<KMLEditModalProps> = ({ isOpen, onClose, onSuccess, kmlFile }) => {
  const [formData, setFormData] = useState({
    routeName: '',
    travelMode: 'WALKING',
    tags: '',
    remarks: '',
    isPublic: true,
    isRecommended: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 当模态框打开时初始化表单数据
  useEffect(() => {
    if (isOpen && kmlFile) {
      setFormData({
        routeName: kmlFile.routeName || '',
        travelMode: kmlFile.travelMode || 'WALKING',
        tags: kmlFile.tags || '',
        remarks: kmlFile.remarks || '',
        isPublic: kmlFile.isPublic,
        isRecommended: kmlFile.isRecommended
      });
      setError('');
    }
  }, [isOpen, kmlFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!kmlFile) return;

    setSaving(true);
    setError('');

    try {
      const response = await kmlAPI.updateKMLFile(kmlFile.id, formData);
      console.log('更新成功:', response);
      
      // 关闭模态框
      onClose();
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err: any) {
      console.error('更新失败:', err);
      setError(err.message || '更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError('');
      onClose();
    }
  };

  const getTravelModeText = (mode: string) => {
    const modes: { [key: string]: string } = {
      'WALKING': '徒步',
      'DRIVING': '自驾',
      'CYCLING': '骑行',
      'MOTORCYCLE': '摩托车',
      'RV': '房车',
      'PUBLIC_TRANSPORT': '公共交通'
    };
    return modes[mode] || mode;
  };

  if (!isOpen || !kmlFile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-5/6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">编辑KML文件信息</h2>
            <p className="text-sm text-gray-600 mt-1">{kmlFile.fileName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* 基本信息（只读） */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">文件基本信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">文件名:</span>
                <span className="ml-2 text-gray-900">{kmlFile.fileName}</span>
              </div>
              <div>
                <span className="text-gray-500">文件大小:</span>
                <span className="ml-2 text-gray-900">{(kmlFile.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-gray-500">轨迹点:</span>
                <span className="ml-2 text-gray-900">{kmlFile.trackPointCount}</span>
              </div>
              <div>
                <span className="text-gray-500">标注点:</span>
                <span className="ml-2 text-gray-900">{kmlFile.placemarkCount}</span>
              </div>
              {kmlFile.totalDistance > 0 && (
                <div>
                  <span className="text-gray-500">总距离:</span>
                  <span className="ml-2 text-gray-900">{(kmlFile.totalDistance / 1000).toFixed(1)} km</span>
                </div>
              )}
              {kmlFile.maxAltitude > 0 && (
                <div>
                  <span className="text-gray-500">海拔范围:</span>
                  <span className="ml-2 text-gray-900">{kmlFile.minAltitude}m - {kmlFile.maxAltitude}m</span>
                </div>
              )}
            </div>
          </div>

          {/* 可编辑信息 */}
          <div className="space-y-4">
            {/* 路线名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                路线名称 *
              </label>
              <input
                type="text"
                name="routeName"
                value={formData.routeName}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="请输入路线名称"
                required
              />
            </div>

            {/* 出行方式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出行方式
              </label>
              <select
                name="travelMode"
                value={formData.travelMode}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="WALKING">徒步</option>
                <option value="DRIVING">自驾</option>
                <option value="CYCLING">骑行</option>
                <option value="MOTORCYCLE">摩托车</option>
                <option value="RV">房车</option>
                <option value="PUBLIC_TRANSPORT">公共交通</option>
              </select>
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="请输入标签，多个标签用逗号分隔"
              />
              <p className="mt-1 text-xs text-gray-500">
                例如：山地,徒步,风景,挑战
              </p>
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注信息
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                disabled={saving}
                placeholder="请输入对此路线的描述或备注..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                rows={4}
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.remarks.length}/1000
              </p>
            </div>

            {/* 设置选项 */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  公开显示 - 允许其他用户查看此路线
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={formData.isRecommended}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  推荐路线 - 将此路线标记为推荐路线
                </label>
              </div>
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.routeName.trim() || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </span>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMLEditModal; 