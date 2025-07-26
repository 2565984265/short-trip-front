'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { HeartIcon, BookmarkIcon, EyeIcon, StarIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Guide, DIFFICULTY_LEVELS } from '@/types/guide';
import { RichTextDisplay } from '@/components/common/RichTextEditor';

export default function GuideDetailPage() {
  const params = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchGuideDetail();
    }
  }, [params.id]);

  const fetchGuideDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/guides/${params.id}`);
      const data = await response.json();
      if (data.code === 0) {
        setGuide(data.data);
      }
    } catch (error) {
      console.error('获取指南详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!guide) return;
    try {
      const response = await fetch(`http://localhost:8080/api/guides/${guide.id}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.code === 0) {
        setGuide(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleFavorite = async () => {
    if (!guide) return;
    try {
      const response = await fetch(`http://localhost:8080/api/guides/${guide.id}/favorite`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.code === 0) {
        setGuide(prev => prev ? { ...prev, favoriteCount: prev.favoriteCount + 1 } : null);
      }
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const handleRate = async () => {
    if (!guide || userRating === 0) return;
    try {
      const response = await fetch(`http://localhost:8080/api/guides/${guide.id}/rate?rating=${userRating}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.code === 0) {
        // 重新获取指南数据以更新评分
        fetchGuideDetail();
        setShowRatingModal(false);
        setUserRating(0);
      }
    } catch (error) {
      console.error('评分失败:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    const difficulty = DIFFICULTY_LEVELS.find(d => d.value === level);
    return difficulty?.color || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareGuide = () => {
    if (navigator.share) {
      navigator.share({
        title: guide?.title,
        text: guide?.summary,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">指南不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 返回按钮 */}
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>返回</span>
            </button>
          </div>

          {/* 指南头部 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            {/* 封面图片 */}
            <div className="relative h-64 md:h-80">
              <img
                src={guide.coverImage || '/images/placeholder.jpg'}
                alt={guide.title}
                className="w-full h-full object-cover"
              />
              {guide.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">精选</span>
                </div>
              )}
            </div>

            {/* 标题和基本信息 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{guide.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(guide.difficultyLevel)}`}>
                  {guide.difficultyLevelDisplay}
                </span>
              </div>

              <div className="text-gray-600 text-lg mb-6">
                <RichTextDisplay 
                  content={guide.summary} 
                  className="text-lg text-gray-600"
                />
              </div>

              {/* 标签 */}
              {guide.tags && guide.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {guide.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 基本信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">目的地</div>
                  <div className="font-medium">{guide.destination}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">预计时间</div>
                  <div className="font-medium">{guide.estimatedTime}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">预计费用</div>
                  <div className="font-medium">{guide.estimatedCost}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">交通方式</div>
                  <div className="font-medium">{guide.transportMode}</div>
                </div>
              </div>

              {/* 作者和统计信息 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>作者：{guide.author}</span>
                  <span>发布时间：{formatTime(guide.createTime)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">{guide.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({guide.ratingCount})</span>
                  </div>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    评分
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 指南内容 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">详细指南</h2>
            <div className="prose max-w-none">
              <RichTextDisplay 
                content={guide.content} 
                className="prose prose-lg max-w-none text-gray-700"
              />
            </div>
          </div>

          {/* 图片展示 */}
          {guide.images && guide.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">相关图片</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guide.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 互动区域 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <HeartIcon className="w-6 h-6" />
                  <span>{guide.likeCount}</span>
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex items-center space-x-2 text-gray-500 hover:text-yellow-500 transition-colors"
                >
                  <BookmarkIcon className="w-6 h-6" />
                  <span>{guide.favoriteCount}</span>
                </button>
                <span className="flex items-center space-x-2 text-gray-500">
                  <EyeIcon className="w-6 h-6" />
                  <span>{guide.viewCount}</span>
                </span>
              </div>
              <button
                onClick={shareGuide}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>分享</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 评分模态框 */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">为这个指南评分</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-2xl ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setUserRating(0);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleRate}
                disabled={userRating === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                提交评分
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 