'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { User } from '@/types';
import { 
  ArrowLeft,
  MessageCircle,
  GraduationCap,
  MapPin,
  Calendar,
  Mail,
  Globe,
  Send,
  UserCheck
} from 'lucide-react';

export default function UserProfilePage() {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfileUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('사용자를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sendDirectMessage = async () => {
    if (!currentUser || !profileUser) return;

    try {
      // 이미 채팅방이 있는지 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', [currentUser.id])
        .contains('user_ids', [profileUser.id])
        .single();

      if (existingRoom) {
        // 기존 채팅방으로 이동
        router.push(`/chat/${existingRoom.id}`);
        return;
      }

      // 새 채팅방 생성
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          user_ids: [currentUser.id, profileUser.id]
        })
        .select()
        .single();

      if (error) throw error;

      // 새 채팅방으로 이동
      router.push(`/chat/${newRoom.id}`);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900">사용자를 찾을 수 없습니다</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link
              href="/users"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              친구 찾기로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profileUser.id;

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            친구 찾기로 돌아가기
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
                    {profileUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-6 mt-16">
                  <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatRelativeTime(profileUser.created_at)} 가입
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              {!isOwnProfile && isAuthenticated && (
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={sendDirectMessage}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>DM 보내기</span>
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>친구 추가</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profileUser.email}</span>
                  </div>
                  {profileUser.school && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-900">{profileUser.school}</span>
                    </div>
                  )}
                  {profileUser.major && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="text-gray-900">{profileUser.major}</span>
                    </div>
                  )}
                  {profileUser.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span className="text-gray-900">{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.nationality && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-900">{profileUser.nationality}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">소개</h3>
                {profileUser.bio ? (
                  <p className="text-gray-700 leading-relaxed">{profileUser.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">아직 자기소개가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {!isOwnProfile && isAuthenticated && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 행동</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={sendDirectMessage}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>메시지 보내기</span>
                  </button>
                  <Link
                    href={`/posts/create?mention=${profileUser.name}`}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <span>@{profileUser.name} 언급하기</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 