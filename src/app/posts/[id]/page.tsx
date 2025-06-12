'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/lib/utils';
import type { Post, Comment as CommentType, User } from '@/types';
import { 
  ArrowLeft,
  MessageCircle,
  Calendar,
  ShoppingBag,
  BookOpen,
  Home,
  Briefcase,
  Users,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface CategoryInfo {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CATEGORIES: CategoryInfo[] = [
  { value: 'general', label: '자유게시판', icon: MessageCircle, color: 'text-blue-600 bg-blue-50' },
  { value: 'question', label: '질문', icon: Users, color: 'text-green-600 bg-green-50' },
  { value: 'event', label: '행사', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
  { value: 'marketplace', label: '중고거래', icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
  { value: 'study', label: '스터디', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
  { value: 'housing', label: '주거', icon: Home, color: 'text-pink-600 bg-pink-50' },
  { value: 'job', label: '취업', icon: Briefcase, color: 'text-gray-600 bg-gray-50' },
];

interface PostWithUser extends Omit<Post, 'user'> {
  user: User;
}

interface CommentWithUser extends Omit<CommentType, 'user'> {
  user: User;
}

export default function PostDetailPage() {
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('게시글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: commentText.trim()
      });

      if (error) throw error;

      setCommentText('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !user || post.user_id !== user.id) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;

      router.push('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">게시글을 찾을 수 없습니다</h3>
          <p className="mt-2 text-gray-600">{error || '존재하지 않는 게시글입니다.'}</p>
          <Link
            href="/posts"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(post.category);
  const CategoryIcon = categoryInfo.icon;
  const isAuthor = user && post.user_id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/posts"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            커뮤니티로 돌아가기
          </Link>
        </div>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {categoryInfo.label}
                  </span>
                  <div className="text-sm text-gray-500">
                    {post.user.name} • {formatRelativeTime(post.created_at)}
                  </div>
                </div>
              </div>
              
              {isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              댓글 {comments.length}개
            </h2>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        !commentText.trim() || isSubmittingComment
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSubmittingComment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다</p>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  로그인하기
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-gray-100 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{comment.user.name}</span>
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">게시글 삭제</h3>
              <p className="text-gray-600 mb-4">
                정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDeletePost}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 