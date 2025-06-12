'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import type { Job } from '@/types';
import { 
  Building, 
  MapPin, 
  Clock, 
  Briefcase,
  ExternalLink,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { user } = useAuth();
  
  const jobId = params.id;

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            poster:users(*)
          `)
          .eq('id', jobId)
          .single();
        
        if (error) throw error;
        
        setJob(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'full-time': return '정규직';
      case 'part-time': return '파트타임';
      case 'internship': return '인턴';
      case 'contract': return '계약직';
      default: return jobType;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">채용 공고를 찾을 수 없습니다.</h2>
        <p className="text-gray-600 mt-2">삭제되었거나 잘못된 경로일 수 있습니다.</p>
        <Link href="/jobs" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {getJobTypeLabel(job.job_type)}
              </span>
              <span className="text-sm text-gray-500">
                게시일: {format(new Date(job.created_at), 'yyyy년 MM월 dd일')}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>{job.company_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{getJobTypeLabel(job.job_type)}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 mb-8">
              <p>{job.description}</p>
            </div>
            
            {job.application_url && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">지원 링크</h3>
                <a 
                  href={job.application_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  {job.application_url}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}
            
            <div className="border-t mt-8 pt-6">
                <h3 className="font-semibold text-gray-800 mb-3">게시자 정보</h3>
                <div className="flex items-center space-x-3">
                    <UserCircle className="h-10 w-10 text-gray-400" />
                    <div>
                        <p className="font-medium text-gray-900">{job.poster?.name || '정보 없음'}</p>
                        <p className="text-sm text-gray-500">
                          공고 게시일: {format(new Date(job.created_at), 'yyyy-MM-dd')}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
            <Link href="/jobs" className="text-blue-600 hover:underline font-medium">
                &larr; 채용 목록으로 돌아가기
            </Link>
        </div>
      </div>
    </div>
  );
} 