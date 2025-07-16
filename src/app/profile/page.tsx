'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/common/ClientOnly';
import { useUser } from '@/contexts/UserContext';
import PostCard from '@/components/profile/PostCard';
import GuideCard from '@/components/profile/GuideCard';
import PostEditModal from '@/components/profile/PostEditModal';
import GuideEditModal from '@/components/profile/GuideEditModal';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { postAPI, guideAPI, userAPI, ApiResponse, PageResponse, getFileUrl } from '@/services/api';

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
  const { user, isAuthenticated, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'guides' | 'about'>('posts');
  
  // 动态相关状态
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(0);
  const [postsHasMore, setPostsHasMore] = useState(true);
  
  // 攻略相关状态
  const [guides, setGuides] = useState<any[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [guidesPage, setGuidesPage] = useState(0);
  const [guidesHasMore, setGuidesHasMore] = useState(true);
  
  // 模态框状态
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 加载动态
  const loadPosts = async (page = 0, append = false) => {
    if (postsLoading) return;
    
    setPostsLoading(true);
    try {
      const response = await postAPI.getMyPosts(page) as ApiResponse<PageResponse<any>>;
      if (response.code === 0) {
        const newPosts = response.data.content;
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setPostsHasMore(!response.data.last);
        setPostsPage(page);
      }
    } catch (error) {
      console.error('加载动态失败:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  // 加载攻略
  const loadGuides = async (page = 0, append = false) => {
    if (guidesLoading) return;
    
    setGuidesLoading(true);
    try {
      const response = await guideAPI.getMyGuides(page) as ApiResponse<PageResponse<any>>;
      if (response.code === 0) {
        // 为当前用户的攻略添加isOwned属性
        const newGuides = response.data.content.map((guide: any) => ({
          ...guide,
          isOwned: true
        }));
        if (append) {
          setGuides(prev => [...prev, ...newGuides]);
        } else {
          setGuides(newGuides);
        }
        setGuidesHasMore(!response.data.last);
        setGuidesPage(page);
      }
    } catch (error) {
      console.error('加载攻略失败:', error);
    } finally {
      setGuidesLoading(false);
    }
  };

  // 切换标签页时加载数据 - 移到所有条件返回之前
  useEffect(() => {
    if (isAuthenticated && user) {
      if (activeTab === 'posts' && posts.length === 0) {
        loadPosts(0);
      } else if (activeTab === 'guides' && guides.length === 0) {
        loadGuides(0);
      }
    }
  }, [activeTab, isAuthenticated, user, posts.length, guides.length]);

  // 如果还在加载中，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，跳转到登录页
  if (!isAuthenticated) {
    router.push('/login');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  // 如果没有用户信息，显示错误
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">用户信息加载失败</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新登录
          </button>
        </div>
      </div>
    );
  }


  // 处理动态操作
  const handleCreatePost = async (postData: any) => {
    try {
      const response = await postAPI.createPost(postData) as ApiResponse<any>;
      if (response.code === 0) {
        loadPosts(0); // 重新加载第一页
        setPostModalOpen(false);
      }
    } catch (error) {
      console.error('创建动态失败:', error);
      alert('创建动态失败');
    }
  };

  const handleUpdatePost = async (postData: any) => {
    if (!editingPost?.id) return;
    
    try {
      const response = await postAPI.updatePost(editingPost.id, postData) as ApiResponse<any>;
      if (response.code === 0) {
        loadPosts(0); // 重新加载第一页
        setPostModalOpen(false);
        setEditingPost(null);
      }
    } catch (error) {
      console.error('更新动态失败:', error);
      alert('更新动态失败');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('确定要删除这条动态吗？')) return;
    
    try {
      const response = await postAPI.deletePost(postId) as ApiResponse<void>;
      if (response.code === 0) {
        loadPosts(0); // 重新加载第一页
      }
    } catch (error) {
      console.error('删除动态失败:', error);
      alert('删除动态失败');
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await postAPI.likePost(postId);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleUnlikePost = async (postId: number) => {
    try {
      await postAPI.unlikePost(postId);
    } catch (error) {
      console.error('取消点赞失败:', error);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setPostModalOpen(true);
  };

  const handleCreateNewPost = () => {
    setEditingPost(null);
    setPostModalOpen(true);
  };

  // 攻略处理函数
  const handleCreateGuide = async (guideData: any) => {
    try {
      const response = await guideAPI.createGuide(guideData) as ApiResponse<any>;
      if (response.code === 0) {
        loadGuides(0, false); // 重新加载攻略列表
      }
    } catch (error) {
      console.error('创建攻略失败:', error);
    }
  };

  const handleUpdateGuide = async (guideData: any) => {
    if (!editingGuide) return;
    
    try {
      const response = await guideAPI.updateGuide(editingGuide.id, guideData) as ApiResponse<any>;
      if (response.code === 0) {
        loadGuides(0, false); // 重新加载攻略列表
      }
    } catch (error) {
      console.error('更新攻略失败:', error);
    }
  };

  const handleDeleteGuide = async (guideId: number) => {
    if (!confirm('确定要删除这个攻略吗？')) return;
    
    try {
      const response = await guideAPI.deleteGuide(guideId) as ApiResponse<any>;
      if (response.code === 0) {
        setGuides(guides.filter(guide => guide.id !== guideId));
      }
    } catch (error) {
      console.error('删除攻略失败:', error);
    }
  };

  const handleLikeGuide = async (guideId: number) => {
    try {
      await guideAPI.likeGuide(guideId);
      setGuides(guides.map(guide => 
        guide.id === guideId 
          ? { ...guide, likeCount: guide.likeCount + 1 }
          : guide
      ));
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleFavoriteGuide = async (guideId: number) => {
    try {
      await guideAPI.favoriteGuide(guideId);
      setGuides(guides.map(guide => 
        guide.id === guideId 
          ? { ...guide, favoriteCount: guide.favoriteCount + 1 }
          : guide
      ));
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const handleEditGuide = (guide: any) => {
    setEditingGuide(guide);
    setGuideModalOpen(true);
  };

  const handleCreateNewGuide = () => {
    setEditingGuide(null);
    setGuideModalOpen(true);
  };

  // 个人资料处理函数
  const handleUpdateProfile = async (profileData: any) => {
    try {
      const response = await userAPI.updateProfile(profileData) as ApiResponse<any>;
      if (response.code === 0) {
        // 这里可以更新用户上下文或重新获取用户信息
        window.location.reload(); // 简单的刷新方式
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
    }
  };



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
                  src={getFileUrl(user.avatar)}
                  alt={user.nickname || user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </ClientOnly>
            </div>

            {/* 基本信息 */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">{user.nickname || user.username}</h1>
                {user.isCreator && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    创作者
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{user.bio || '这个人很懒，还没有写简介'}</p>
              
              {/* 统计信息 */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <span>{user.followerCount || 0} 粉丝</span>
                <span>{user.followingCount || 0} 关注</span>
                <span>{user.postCount || 0} 动态</span>
                <span>{user.guideCount || 0} 攻略</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
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
                动态 ({user.postCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('guides')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guides'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                攻略 ({user.guideCount || 0})
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
              <div>
                {/* 发布动态按钮 */}
                <div className="mb-6">
                  <button
                    onClick={handleCreateNewPost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✏️ 发布动态
                  </button>
                </div>

                {/* 动态列表 */}
                <div className="space-y-6">
                  {postsLoading && posts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">加载中...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">还没有发布过动态</p>
                      <button
                        onClick={handleCreateNewPost}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        发布第一条动态
                      </button>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        onLike={handleLikePost}
                        onUnlike={handleUnlikePost}
                      />
                    ))
                  )}
                </div>

                {/* 加载更多 */}
                {postsHasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => loadPosts(postsPage + 1, true)}
                      disabled={postsLoading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {postsLoading ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guides' && (
              <div>
                {/* 创建攻略按钮 */}
                <div className="mb-6">
                  <button
                    onClick={handleCreateNewGuide}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✏️ 创建攻略
                  </button>
                </div>

                {/* 攻略列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {guidesLoading && guides.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">加载中...</p>
                    </div>
                  ) : guides.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">还没有创建过攻略</p>
                      <button
                        onClick={handleCreateNewGuide}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        创建第一篇攻略
                      </button>
                    </div>
                  ) : (
                    guides.map((guide) => (
                      <GuideCard
                        key={guide.id}
                        guide={guide}
                        onEdit={handleEditGuide}
                        onDelete={handleDeleteGuide}
                        onLike={handleLikeGuide}
                        onFavorite={handleFavoriteGuide}
                      />
                    ))
                  )}
                </div>

                {/* 加载更多 */}
                {guidesHasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => loadGuides(guidesPage + 1, true)}
                      disabled={guidesLoading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {guidesLoading ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">基本信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-900">用户名：</span>
                      <span className="text-gray-600">{user.username}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">邮箱：</span>
                      <span className="text-gray-600">{user.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">角色：</span>
                      <span className="text-gray-600">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">个人简介</h3>
                  <p className="text-gray-600">{user.bio || '这个人很懒，还没有写简介'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 动态编辑模态框 */}
      <PostEditModal
        isOpen={postModalOpen}
        onClose={() => {
          setPostModalOpen(false);
          setEditingPost(null);
        }}
        onSave={editingPost ? handleUpdatePost : handleCreatePost}
        post={editingPost}
        isEdit={!!editingPost}
      />

      {/* 攻略编辑模态框 */}
      <GuideEditModal
        isOpen={guideModalOpen}
        onClose={() => {
          setGuideModalOpen(false);
          setEditingGuide(null);
        }}
        onSave={editingGuide ? handleUpdateGuide : handleCreateGuide}
        guide={editingGuide}
        title={editingGuide ? '编辑攻略' : '创建攻略'}
      />

      {/* 个人资料编辑模态框 */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleUpdateProfile}
        user={user}
      />
    </div>
  );
} 