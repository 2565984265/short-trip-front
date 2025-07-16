'use client';
import { useState, useEffect } from 'react';
import { HeartIcon, BookmarkIcon, EyeIcon, StarIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Guide, GuideFilter, DIFFICULTY_LEVELS, SEASONS, TRANSPORT_MODES } from '@/types/guide';
import { guideAPI, ApiResponse } from '@/services/api';
import { AIService } from '@/services/ai';

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [featuredGuides, setFeaturedGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GuideFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI推荐相关状态
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiService] = useState(() => AIService.getInstance());

  useEffect(() => {
    fetchGuides();
    fetchFeaturedGuides();
  }, [currentPage, filter]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await guideAPI.getGuides(currentPage, 10, filter.sortBy || 'createTime', filter.sortDir || 'desc') as ApiResponse<any>;
      if (response.code === 0) {
        setGuides(response.data.content || response.data);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('获取指南失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedGuides = async () => {
    try {
      const response = await guideAPI.getFeaturedGuides() as ApiResponse<Guide[]>;
      if (response.code === 0) {
        setFeaturedGuides(response.data || []);
      }
    } catch (error) {
      console.error('获取精选指南失败:', error);
    }
  };

  // AI推荐功能
  const handleAIRecommendation = async () => {
    if (!searchQuery.trim()) {
      alert('请输入您的旅行需求');
      return;
    }

    setAILoading(true);
    try {
      const response = await aiService.sendMessage({
        message: `我想找一些旅行指南：${searchQuery}`,
        conversationId: 'guides-recommendation'
      });

      if (response.success && response.data) {
        setAIRecommendations([{
          id: Date.now().toString(),
          content: response.data.content,
          sources: response.data.sources,
          timestamp: new Date()
        }]);
        setShowAIRecommendation(true);
      }
    } catch (error) {
      console.error('AI推荐失败:', error);
      alert('AI推荐服务暂时不可用，请稍后再试');
    } finally {
      setAILoading(false);
    }
  };

  const handleLike = async (guideId: string) => {
    // 实现点赞功能
    console.log('点赞指南:', guideId);
  };

  const handleBookmark = async (guideId: string) => {
    // 实现收藏功能
    console.log('收藏指南:', guideId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: Partial<GuideFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">旅行指南</h1>
          <p className="text-gray-600">发现精选的旅行攻略，规划你的完美旅程</p>
        </div>

        {/* 搜索和AI推荐 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索指南或描述你的旅行需求..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAIRecommendation()}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAIRecommendation}
                disabled={aiLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>AI分析中...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>AI推荐</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>筛选</span>
              </button>
            </div>
          </div>

          {/* AI推荐结果 */}
          {showAIRecommendation && aiRecommendations.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                  🤖 AI推荐结果
                </h3>
                <button
                  onClick={() => setShowAIRecommendation(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
              {aiRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="space-y-3">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-blue-800">
                      {recommendation.content}
                    </div>
                  </div>
                  {recommendation.sources && recommendation.sources.length > 0 && (
                    <details className="text-sm text-blue-600">
                      <summary className="cursor-pointer hover:text-blue-800">
                        数据来源 ({recommendation.sources.length})
                      </summary>
                      <div className="mt-2 space-y-1">
                        {recommendation.sources.map((source: string, index: number) => (
                          <div key={index} className="text-blue-700">
                            • {source}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">筛选条件</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
                 <select
                   value={filter.difficultyLevel || ''}
                   onChange={(e) => handleFilterChange({ difficultyLevel: e.target.value || undefined })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="">全部</option>
                   {DIFFICULTY_LEVELS.map(level => (
                     <option key={level.value} value={level.value}>{level.label}</option>
                   ))}
                 </select>
               </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">季节</label>
                <select
                  value={filter.season || ''}
                  onChange={(e) => handleFilterChange({ season: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  {SEASONS.map(season => (
                    <option key={season.value} value={season.value}>{season.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出行方式</label>
                <select
                  value={filter.transportMode || ''}
                  onChange={(e) => handleFilterChange({ transportMode: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  {TRANSPORT_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                                 <select
                   value={`${filter.sortBy || 'createTime'}-${filter.sortDir || 'desc'}`}
                   onChange={(e) => {
                     const [sortBy, sortDir] = e.target.value.split('-');
                     handleFilterChange({ 
                       sortBy: sortBy as 'createTime' | 'viewCount' | 'rating', 
                       sortDir: sortDir as 'asc' | 'desc' 
                     });
                   }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createTime-desc">最新发布</option>
                  <option value="viewCount-desc">浏览最多</option>
                  <option value="likeCount-desc">点赞最多</option>
                  <option value="rating-desc">评分最高</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 精选指南 */}
        {featuredGuides.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">精选指南</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGuides.map((guide) => (
                                 <GuideCard
                   key={guide.id}
                   guide={guide}
                   onLike={() => handleLike(guide.id.toString())}
                   onBookmark={() => handleBookmark(guide.id.toString())}
                   featured={true}
                 />
              ))}
            </div>
          </div>
        )}

        {/* 指南列表 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">所有指南</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : guides.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                                     <GuideCard
                     key={guide.id}
                     guide={guide}
                     onLike={() => handleLike(guide.id.toString())}
                     onBookmark={() => handleBookmark(guide.id.toString())}
                   />
                ))}
              </div>
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无指南</h3>
              <p className="text-gray-600">尝试调整筛选条件或使用AI推荐功能</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 指南卡片组件
function GuideCard({ guide, onLike, onBookmark, featured = false }: {
  guide: Guide;
  onLike: () => void;
  onBookmark: () => void;
  featured?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${featured ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="relative">
        <img
          src={guide.coverImage || '/images/placeholder.jpg'}
          alt={guide.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {featured && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            精选
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={() => {
              setLiked(!liked);
              onLike();
            }}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
          >
            {liked ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => {
              setBookmarked(!bookmarked);
              onBookmark();
            }}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
          >
            <BookmarkIcon className={`h-5 w-5 ${bookmarked ? 'text-blue-500' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {guide.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {guide.summary}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-600">{guide.rating || 4.5}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{guide.viewCount || 0}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {guide.estimatedTime}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {guide.destination}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {guide.difficultyLevel}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {guide.author}
          </span>
        </div>
      </div>
    </div>
  );
}