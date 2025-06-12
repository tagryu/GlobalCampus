'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import type { Post, PostCategory } from '@/types';
import { 
  Plus, 
  Search, 
  MessageCircle,
  Calendar,
  ShoppingBag,
  BookOpen,
  Home,
  Briefcase,
  Users
} from 'lucide-react';

interface CategoryInfo {
  value: PostCategory;
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

function PostsContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');
  
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const category = searchParams.get('category') as PostCategory;
    if (category && CATEGORIES.find(c => c.value === category)) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            user:users(*),
            comments(count)
          `)
          .order('created_at', { ascending: false });

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        const postsWithCommentCount = data?.map(post => ({
          ...post,
          comment_count: post.comments?.[0]?.count || 0
        })) || [];
        
        setPosts(postsWithCommentCount);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [selectedCategory]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
            <p className="text-gray-600">유학생들과 함께 정보를 공유하고 소통해보세요</p>
          </div>
          
          {isAuthenticated && (
            <Link
              href="/posts/create"
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>글쓰기</span>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">게시글이 없습니다</h3>
                <p className="mt-2 text-gray-600">
                  {isAuthenticated 
                    ? '첫 번째 게시글을 작성해보세요!'
                    : '로그인 후 게시글을 작성해보세요!'
                  }
                </p>
                {isAuthenticated && (
                  <Link
                    href="/posts/create"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    글쓰기
                  </Link>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => {
                const categoryInfo = getCategoryInfo(post.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Category Badge */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {categoryInfo.label}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {post.title}
                        </h3>
                        
                        {/* Content Preview */}
                        <p className="text-gray-600 mb-3">
                          {truncateText(post.content, 150)}
                        </p>
                        
                        {/* Meta Information */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.user?.name || '익명'}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(post.created_at)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comment_count || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Images Indicator */}
                      {post.images && post.images.length > 0 && (
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              +{post.images.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PostsContent />
    </Suspense>
  );
} 