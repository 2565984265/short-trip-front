'use client';

import React, { useState, useEffect } from 'react';
import { kmlAPI } from '../../services/kml';
import { downloadFile } from '../../services/api';
import KMLUploadModal from '../../components/kml/KMLUploadModal';
import KMLPreviewModal from '../../components/kml/KMLPreviewModal';
import KMLEditModal from '../../components/kml/KMLEditModal';
import dynamic from 'next/dynamic';

// 动态导入KMLOnlineEditor组件以避免SSR问题
const KMLOnlineEditor = dynamic(() => import('../../components/kml/KMLOnlineEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">正在加载在线编辑器...</p>
      </div>
    </div>
  )
});

interface APIResponse<T> {
  data: T;
  code: number;
  message: string;
}

interface PageData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
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

const KMLManagerPage: React.FC = () => {
  const [kmlFiles, setKMLFiles] = useState<KMLFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasUploadPermission, setHasUploadPermission] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOnlineEditor, setShowOnlineEditor] = useState(false);
  const [editingKMLFile, setEditingKMLFile] = useState<any>(null); // 正在编辑的KML文件
  const [selectedFile, setSelectedFile] = useState<KMLFile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 检查上传权限
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await kmlAPI.checkUploadPermission() as APIResponse<boolean>;
        setHasUploadPermission(response.data || false);
      } catch (error) {
        console.error('检查权限失败:', error);
      }
    };
    checkPermission();
  }, []);

  // 加载KML文件列表
  const loadKMLFiles = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await kmlAPI.getPublicKMLFiles(page, 10) as APIResponse<PageData<KMLFile>>;
      
      if (response.data && response.data.content) {
        setKMLFiles(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setCurrentPage(page);
      }
    } catch (err: any) {
      console.error('加载KML文件失败:', err);
      setError('加载KML文件失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKMLFiles();
  }, []);

  const handleUploadSuccess = () => {
    // 上传成功后重新加载列表
    loadKMLFiles(currentPage);
  };

  const handlePreview = (file: KMLFile) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  // 处理在线编辑（原预览功能改为编辑）
  const handleOnlineEdit = (file: any) => {
    console.log('打开在线编辑器编辑文件:', file.fileName);
    setEditingKMLFile(file);
    setShowOnlineEditor(true);
  };

  const handleEdit = (file: KMLFile) => {
    setSelectedFile(file);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // 编辑成功后重新加载列表
    loadKMLFiles(currentPage);
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      await downloadFile(`/api/kml-files/${fileId}/download`, fileName);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请稍后重试');
    }
  };

  // 处理在线制作的KML保存
  const handleOnlineKMLSave = async (kmlData: any) => {
    try {
      const response = await kmlAPI.createOnlineKML(kmlData) as APIResponse<any>;
      if (response.code === 0) {
        console.log('在线KML保存成功:', response);
        setShowOnlineEditor(false);
        // 重新加载KML文件列表
        loadKMLFiles(currentPage);
        alert('KML文件创建成功！');
      } else {
        alert('保存失败: ' + response.message);
      }
    } catch (error: any) {
      console.error('保存在线KML失败:', error);
      alert('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KML文件管理</h1>
              <p className="mt-2 text-gray-600">
                管理和浏览KML路线文件 (共 {totalElements} 个文件)
              </p>
            </div>
            {hasUploadPermission && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setEditingKMLFile(null); // 清除编辑状态，创建新路线
                    setShowOnlineEditor(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  在线制作
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  上传KML文件
                </button>
              </div>
            )}
          </div>
          
          {!hasUploadPermission && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                您当前没有上传KML文件的权限。只有特定用户可以上传文件。
              </p>
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* KML文件列表 */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {kmlFiles.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无KML文件</h3>
              <p className="mt-1 text-sm text-gray-500">还没有上传任何KML文件</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      路线详情
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      统计信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kmlFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {file.fileName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatFileSize(file.fileSize)} • {formatDate(file.uploadTime)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{file.routeName || file.documentName}</div>
                          <div className="text-gray-500">{getTravelModeText(file.travelMode)}</div>
                          {file.tags && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {file.tags}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>轨迹点: {file.trackPointCount}</div>
                        <div>标注点: {file.placemarkCount}</div>
                        {file.totalDistance && (
                          <div>距离: {(file.totalDistance / 1000).toFixed(1)}km</div>
                        )}
                        {file.maxAltitude && (
                          <div>海拔: {file.minAltitude}m - {file.maxAltitude}m</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {file.isPublic && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              公开
                            </span>
                          )}
                          {file.isRecommended && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              推荐
                            </span>
                          )}
                          <div className="text-xs text-gray-500">
                            ⭐ {file.rating} ({file.viewCount} 浏览)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOnlineEdit(file)}
                            className="text-green-600 hover:text-green-900"
                          >
                            在线绘制
                          </button>
                          <button
                            onClick={() => handleEdit(file)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            下载
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => loadKMLFiles(currentPage - 1)}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => loadKMLFiles(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{currentPage * 10 + 1}</span> 到{' '}
                  <span className="font-medium">{Math.min((currentPage + 1) * 10, totalElements)}</span> 项，
                  共 <span className="font-medium">{totalElements}</span> 项
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => loadKMLFiles(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => loadKMLFiles(i)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        i === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => loadKMLFiles(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 上传模态框 */}
      <KMLUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* 预览模态框 */}
      <KMLPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        fileId={selectedFile?.id || 0}
        fileName={selectedFile?.fileName || ''}
      />

      {/* 编辑模态框 */}
      <KMLEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        kmlFile={selectedFile}
      />

      {/* 在线制作模态框 */}
      <KMLOnlineEditor
        isOpen={showOnlineEditor}
        onClose={() => setShowOnlineEditor(false)}
        onSave={handleOnlineKMLSave}
      />
    </div>
  );
};

export default KMLManagerPage; 