'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/lib/utils';
import { 
  ArrowLeft,
  Edit,
  GraduationCap,
  MapPin,
  Calendar,
  Mail,
  Globe,
  Settings,
  User
} from 'lucide-react';

export default function MyProfilePage() {
  const [authChecked, setAuthChecked] = useState(false);
  
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // 인증 상태가 안정화될 때까지 기다리기
  useEffect(() => {
    if (!authLoading) {
      // 이미 인증되어 있으면 바로 통과
      if (isAuthenticated && user) {
        setAuthChecked(true);
        return;
      }
      
      // 인증되지 않은 경우만 짧은 대기 후 체크
      const timer = setTimeout(() => {
        setAuthChecked(true);
        if (!isAuthenticated || !user) {
          console.log('🚫 Not authenticated, redirecting to login');
          router.push('/login');
        }
      }, 300); // 300ms로 단축

      return () => clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated, user, router]);

  // 인증 체크 전이거나 로그인하지 않은 경우 로딩 표시
  if (authLoading || !authChecked || !isAuthenticated || !user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? '인증 상태 확인 중...' : '프로필 로딩 중...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover & Avatar */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-6 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center -mt-16">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-700">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-6 mt-16">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatRelativeTime(profile.created_at)} 가입
                  </p>
                </div>
              </div>
              
              {/* Edit Button */}
              <div className="flex space-x-3 mt-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>프로필 편집</span>
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>설정</span>
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profile.email}</span>
                  </div>
                  {(profile as any).school && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-900">{(profile as any).school}</span>
                    </div>
                  )}
                  {(profile as any).major && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="text-gray-900">{(profile as any).major}</span>
                    </div>
                  )}
                  {(profile as any).location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span className="text-gray-900">{(profile as any).location}</span>
                    </div>
                  )}
                  {profile.nationality && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-900">{profile.nationality}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">소개</h3>
                {profile.bio ? (
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">아직 자기소개가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">작성한 게시글</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">작성한 댓글</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">친구</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 