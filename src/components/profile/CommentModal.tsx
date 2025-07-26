'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { postAPI, communityAPI, getFileUrl, ApiResponse, PageResponse } from '../../services/api';
import { Comment } from '../../types/community';
import { useUser } from '../../contexts/UserContext';

type ContentType = 'POST' | 'COMMUNITY_POST';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: number;
  contentAuthor: string;
}

export default function CommentModal({ isOpen, onClose, contentType, contentId, contentAuthor }: CommentModalProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 根据内容类型选择 API
  const getAPI = () => {
    return contentType === 'COMMUNITY_POST' ? communityAPI : postAPI;
  };

  // 加载评论
  const loadComments = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const api = getAPI();
      const response = await api.getComments(contentId) as ApiResponse<PageResponse<Comment>>;
      if (response.code === 0) {
        setComments(response.data.content || []);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    } else {
      // 重置状态
      setComments([]);
      setNewComment('');
      setReplyingTo(null);
      setReplyContent('');
    }
  }, [isOpen, contentType, contentId]);

  // 添加评论
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const api = getAPI();
      const response = await api.addComment(contentId, newComment.trim()) as ApiResponse<Comment>;
      if (response.code === 0) {
        setComments(prev => [response.data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('添加评论失败:', error);
      alert('添加评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 回复评论
  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const api = getAPI();
      const response = await api.addComment(contentId, replyContent.trim(), parentId) as ApiResponse<Comment>;
      if (response.code === 0) {
        // 重新加载评论以获取完整的回复结构
        await loadComments();
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (error) {
      console.error('回复评论失败:', error);
      alert('回复评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const api = getAPI();
      const response = await api.deleteComment(contentId, commentId) as ApiResponse<void>;
      if (response.code === 0) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('删除评论失败，请稍后重试');
    }
  };

  // 点赞评论
  const handleLikeComment = async (commentId: number, isLiked: boolean) => {
    try {
      const api = getAPI();
      if (isLiked) {
        await api.unlikeComment(contentId, commentId);
      } else {
        await api.likeComment(contentId, commentId);
      }
      
      // 更新本地状态
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              isLiked: !isLiked,
              likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1
            }
          : comment
      ));
    } catch (error) {
      console.error('点赞评论失败:', error);
    }
  };

  const formatTime = (dateString: string | any) => {
    try {
      // 处理后端返回的LocalDateTime格式
      const dateStr = typeof dateString === 'string' ? dateString : String(dateString);
      return formatDistanceToNow(new Date(dateStr), { 
        addSuffix: true, 
        locale: zhCN 
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString);
      return '刚刚';
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (contentType) {
      case 'COMMUNITY_POST':
        return `社区帖子评论 (${comments.length})`;
      case 'POST':
      default:
        return `动态评论 (${comments.length})`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无评论</p>
              <p className="text-sm text-gray-400 mt-1">来发表第一条评论吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    {/* 头像 */}
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={getFileUrl(comment.userAvatar)}
                        alt={comment.userNickname}
                        fill
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/avatars/user1.jpg';
                        }}
                      />
                    </div>

                    {/* 评论内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.userNickname}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(comment.createTime)}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-gray-700 text-sm">{comment.content}</p>

                      {/* 操作按钮 */}
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        <button
                          onClick={() => handleLikeComment(comment.id, comment.isLiked || false)}
                          className={`flex items-center space-x-1 ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <span>{comment.isLiked ? '❤️' : '🤍'}</span>
                          <span>{comment.likeCount}</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setReplyContent('');
                          }}
                          className="text-gray-500 hover:text-blue-500"
                        >
                          回复
                        </button>

                        {comment.isOwned && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            删除
                          </button>
                        )}
                      </div>

                      {/* 回复框 */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder={`回复 @${comment.userNickname}...`}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim() || submitting}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {submitting ? '回复中...' : '回复'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 子评论 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-3">
                              <div className="relative w-6 h-6 flex-shrink-0">
                                <Image
                                  src={getFileUrl(reply.userAvatar)}
                                  alt={reply.userNickname}
                                  fill
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/avatars/user1.jpg';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 text-xs">
                                    {reply.userNickname}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(reply.createTime)}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700 text-xs">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 添加评论 */}
        {user && (
          <div className="border-t p-4">
            <div className="flex items-start space-x-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={getFileUrl(user.avatar)}
                  alt={user.nickname || user.username}
                  fill
                  className="rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/avatars/user1.jpg';
                  }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="写下你的评论..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {submitting ? '发布中...' : '发布评论'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}