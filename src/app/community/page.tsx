'use client';
import { useState, useEffect } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  type: 'TRAVEL_EXPERIENCE' | 'TRAVEL_TIP' | 'PHOTO_SHARING' | 'QUESTION' | 'DISCUSSION';
  tags: string;
  imageUrls: string;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  createTime: string;
}

const typeLabels = {
  TRAVEL_EXPERIENCE: '旅行体验',
  TRAVEL_TIP: '旅行攻略',
  PHOTO_SHARING: '照片分享',
  QUESTION: '问题咨询',
  DISCUSSION: '讨论交流'
};

const typeColors = {
  TRAVEL_EXPERIENCE: 'bg-blue-100 text-blue-800',
  TRAVEL_TIP: 'bg-green-100 text-green-800',
  PHOTO_SHARING: 'bg-purple-100 text-purple-800',
  QUESTION: 'bg-orange-100 text-orange-800',
  DISCUSSION: 'bg-gray-100 text-gray-800'
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/community/posts?page=0&size=20');
      const data = await response.json();
      if (data.code === 0) {
        setPosts(data.data.content || data.data);
      }
    } catch (error) {
      console.error('获取帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/community/posts/${postId}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.code === 0) {
        // 更新本地状态
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likeCount: post.likeCount + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleFavorite = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/community/posts/${postId}/favorite`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.code === 0) {
        // 更新本地状态
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, favoriteCount: post.favoriteCount + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesType = selectedType === 'all' || post.type === selectedType;
    const matchesKeyword = !searchKeyword || 
      post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      post.content.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesType && matchesKeyword;
  });

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  const parseTags = (tagsString: string) => {
    try {
      return JSON.parse(tagsString) || [];
    } catch {
      return [];
    }
  };

  const parseImages = (imagesString: string) => {
    try {
      return JSON.parse(imagesString) || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">旅行社区</h1>
            <p className="text-lg text-gray-600">分享你的旅行故事，发现更多精彩攻略</p>
          </div>

          {/* 筛选和搜索 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 类型筛选 */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {Object.entries(typeLabels).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 搜索框 */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="搜索帖子..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 帖子列表 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无帖子</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* 置顶标识 */}
                  {post.isPinned && (
                    <div className="bg-red-500 text-white text-xs px-3 py-1 text-center">
                      置顶
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* 帖子头部 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.authorAvatar || '/avatars/placeholder.jpg'}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{post.authorName}</p>
                          <p className="text-sm text-gray-500">{formatTime(post.createTime)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[post.type]}`}>
                        {typeLabels[post.type]}
                      </span>
                    </div>

                    {/* 帖子标题 */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>

                    {/* 帖子内容 */}
                    <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                    {/* 标签 */}
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {parseTags(post.tags).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 图片 */}
                    {post.imageUrls && parseImages(post.imageUrls).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                        {parseImages(post.imageUrls).slice(0, 3).map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {/* 互动按钮 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <HeartIcon className="w-5 h-5" />
                          <span>{post.likeCount}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                          <ChatBubbleLeftIcon className="w-5 h-5" />
                          <span>{post.commentCount}</span>
                        </button>
                        <button
                          onClick={() => handleFavorite(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-yellow-500 transition-colors"
                        >
                          <BookmarkIcon className="w-5 h-5" />
                          <span>{post.favoriteCount}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm">{post.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 