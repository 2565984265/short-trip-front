'use client';

import React, { useState, useEffect } from 'react';
import { getFileContent, downloadFile } from '@/services/api';

interface KMLPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
}

const KMLPreviewModal: React.FC<KMLPreviewModalProps> = ({ isOpen, onClose, fileId, fileName }) => {
  const [kmlContent, setKmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && fileId) {
      loadKMLContent();
    }
  }, [isOpen, fileId]);

  const loadKMLContent = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 调试信息
      const token = localStorage.getItem('token');
      console.log('🔍 KMLPreviewModal - loadKMLContent');
      console.log('🔑 Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('🌐 Request endpoint:', `/api/kml-files/${fileId}`);
      
      const content = await getFileContent(`/api/kml-files/${fileId}`);
      setKmlContent(content);
    } catch (err: any) {
      console.error('加载KML内容失败:', err);
      setError('加载KML文件失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKmlContent('');
    setError('');
    onClose();
  };

  const handleDownload = async () => {
    try {
      await downloadFile(`/api/kml-files/${fileId}/download`, fileName);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请稍后重试');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(kmlContent);
      alert('KML内容已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动选择复制');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">KML文件预览</h2>
            <p className="text-sm text-gray-600 mt-1">{fileName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadKMLContent}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  重新加载
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 工具栏 */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    文件大小: {new Blob([kmlContent]).size} 字节
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      复制内容
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      下载文件
                    </button>
                  </div>
                </div>
              </div>

              {/* KML内容显示 */}
              <div className="flex-1 p-4 overflow-auto">
                <pre className="bg-gray-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap break-words overflow-auto">
                  {kmlContent}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMLPreviewModal; 