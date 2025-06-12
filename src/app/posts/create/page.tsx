'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { PostCategory } from '@/types';
import { 
  ArrowLeft,
  Send,
  MessageCircle,
  Calendar,
  ShoppingBag,
  BookOpen,
  Home,
  Briefcase,
  Users,
  AlertCircle
} from 'lucide-react';

interface CategoryInfo {
  value: PostCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const CATEGORIES: CategoryInfo[] = [
  { 
    value: 'general', 
    label: '자유게시판', 
    icon: MessageCircle, 
    color: 'text-blue-600 bg-blue-50',
    description: '자유로운 주제로 이야기해보세요'
  },
  { 
    value: 'question', 
    label: '질문', 
    icon: Users, 
    color: 'text-green-600 bg-green-50',
    description: '궁금한 것들을 물어보세요'
  },
  { 
    value: 'event', 
    label: '행사', 
    icon: Calendar, 
    color: 'text-purple-600 bg-purple-50',
    description: '이벤트와 모임을 공유해보세요'
  },
  { 
    value: 'marketplace', 
    label: '중고거래', 
    icon: ShoppingBag, 
    color: 'text-orange-600 bg-orange-50',
    description: '물건을 사고팔아보세요'
  },
  { 
    value: 'study', 
    label: '스터디', 
    icon: BookOpen, 
    color: 'text-indigo-600 bg-indigo-50',
    description: '함께 공부할 사람들을 찾아보세요'
  },
  { 
    value: 'housing', 
    label: '주거', 
    icon: Home, 
    color: 'text-pink-600 bg-pink-50',
    description: '숙소와 룸메이트 정보를 공유해보세요'
  },
  { 
    value: 'job', 
    label: '취업', 
    icon: Briefcase, 
    color: 'text-gray-600 bg-gray-50',
    description: '취업 정보와 경험을 나눠보세요'
  },
];

export default function CreatePostPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '' as PostCategory | ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // 로그인하지 않은 사용자 리다이렉트
  if (!loading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '제목은 2자 이상이어야 합니다';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = '제목은 200자를 초과할 수 없습니다';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('posts').insert({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        user_id: user.id
      }).select().single();

      if (error) throw error;

      // 성공 시 게시글 목록으로 이동
      router.push('/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: '게시글 작성 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/posts"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            커뮤니티로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
          <p className="text-gray-600 mt-2">유학생 커뮤니티에 새로운 이야기를 공유해보세요</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                카테고리 선택 *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.value}>
                      <input
                        type="radio"
                        id={category.value}
                        name="category"
                        value={category.value}
                        checked={formData.category === category.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor={category.value}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.category === category.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {category.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="제목을 입력하세요"
              />
              <div className="mt-1 flex justify-between items-center">
                {errors.title ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title}
                  </p>
                ) : (
                  <div></div>
                )}
                <span className="text-xs text-gray-500">
                  {formData.title.length}/200
                </span>
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="내용을 입력하세요..."
              />
              <div className="mt-1 flex justify-between items-center">
                {errors.content ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.content}
                  </p>
                ) : (
                  <div></div>
                )}
                <span className="text-xs text-gray-500">
                  {formData.content.length}자
                </span>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t">
              <Link
                href="/posts"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    작성 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    게시글 작성
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Writing Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 글쓰기 팁</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 제목은 내용을 잘 표현할 수 있도록 구체적으로 작성해주세요</li>
            <li>• 다른 사람이 이해하기 쉽도록 친절하게 설명해주세요</li>
            <li>• 개인정보나 민감한 정보는 공유하지 마세요</li>
            <li>• 서로 존중하는 건전한 커뮤니티 문화를 만들어가요</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 