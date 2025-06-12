'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft,
  Send,
  AlertCircle,
  Building,
  MapPin,
  FileText,
  Link2
} from 'lucide-react';

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'full-time',
    application_url: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

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
    if (!formData.title.trim()) newErrors.title = '직무명을 입력해주세요';
    if (!formData.company_name.trim()) newErrors.company_name = '회사명을 입력해주세요';
    if (!formData.location.trim()) newErrors.location = '근무지를 입력해주세요';
    if (!formData.description.trim()) newErrors.description = '상세 설명을 입력해주세요';
    if (formData.application_url && !formData.application_url.startsWith('http')) {
      newErrors.application_url = '올바른 URL 형식으로 입력해주세요 (예: http://...)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('jobs').insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;
      router.push('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      setErrors({ submit: '채용 공고 등록 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            채용 정보로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">새 채용 공고 등록</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">직무명 *</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className={`w-full input ${errors.title ? 'input-error' : ''}`} placeholder="예: 프론트엔드 개발자" />
                {errors.title && <p className="error-message">{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">회사명 *</label>
                <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleInputChange} className={`w-full input ${errors.company_name ? 'input-error' : ''}`} placeholder="예: GlobalCampus Inc." />
                 {errors.company_name && <p className="error-message">{errors.company_name}</p>}
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">근무지 *</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className={`w-full input ${errors.location ? 'input-error' : ''}`} placeholder="예: 서울시 강남구" />
                {errors.location && <p className="error-message">{errors.location}</p>}
              </div>
              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">직무 형태 *</label>
                <select id="job_type" name="job_type" value={formData.job_type} onChange={handleInputChange} className="w-full input">
                  <option value="full-time">정규직</option>
                  <option value="part-time">파트타임</option>
                  <option value="internship">인턴</option>
                  <option value="contract">계약직</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="application_url" className="block text-sm font-medium text-gray-700 mb-2">지원 링크</label>
                <input type="url" id="application_url" name="application_url" value={formData.application_url} onChange={handleInputChange} className={`w-full input ${errors.application_url ? 'input-error' : ''}`} placeholder="https://..." />
                {errors.application_url && <p className="error-message">{errors.application_url}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">상세 설명 *</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={10} className={`w-full input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="직무 내용, 자격 요건, 우대 사항 등을 입력해주세요." />
              {errors.description && <p className="error-message">{errors.description}</p>}
            </div>
            
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-2" />{errors.submit}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Link href="/jobs" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center">취소</Link>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isSubmitting ? '등록 중...' : '채용 공고 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 