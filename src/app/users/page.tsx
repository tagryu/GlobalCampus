'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { User } from '@/types';
import { 
  Users,
  MessageCircle,
  Search,
  GraduationCap,
  MapPin,
  Calendar,
  UserPlus,
  Clock
} from 'lucide-react';

interface UserWithFriendStatus extends User {
  is_friend?: boolean;
  friend_status?: 'pending' | 'accepted' | 'none' | 'sent' | 'received';
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithFriendStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'school'>('all');
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // 함수들을 useEffect보다 먼저 정의
  const fetchUsers = async () => {
    if (!user) {
      console.log('❌ No user for fetchUsers');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching users...');
      
      // 1. 사용자 목록 가져오기 (자신 제외)
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', user.id);

      // 같은 학교 필터
      if (filterBy === 'school' && (user as any).school) {
        query = query.eq('school', (user as any).school);
      }

      const { data: usersData, error: usersError } = await query
        .order('created_at', { ascending: false })
        .limit(50); // 성능을 위해 제한
      
      if (usersError) {
        console.error('Users fetch error:', usersError);
        // 오류 시 임시 테스트 데이터
        console.log('🧪 Using test data due to error');
        setUsers([
          {
            id: 'test1',
            name: 'Test User 1',
            email: 'test1@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            friend_status: 'none',
            is_friend: false
          },
          {
            id: 'test2', 
            name: 'Test User 2',
            email: 'test2@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            friend_status: 'none',
            is_friend: false
          }
        ] as UserWithFriendStatus[]);
        setLoading(false);
        return;
      }

      console.log('✅ Users fetched:', usersData?.length || 0);

      // 2. 친구 관계 정보 가져오기
      const { data: friendships, error: friendshipError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendshipError) {
        console.error('Friendships fetch error:', friendshipError);
        // 친구 관계 오류는 치명적이지 않으므로 계속 진행
      }

      console.log('✅ Friendships fetched:', friendships?.length || 0);

      // 3. 사용자 데이터에 친구 상태 정보 추가
      const usersWithFriendStatus = (usersData || []).map(userData => {
        const friendship = friendships?.find(f => 
          (f.user_id === user.id && f.friend_id === userData.id) ||
          (f.friend_id === user.id && f.user_id === userData.id)
        );

        let friendStatus: 'none' | 'pending' | 'accepted' | 'sent' | 'received' = 'none';
        
        if (friendship) {
          if (friendship.status === 'accepted') {
            friendStatus = 'accepted';
          } else if (friendship.status === 'pending') {
            if (friendship.user_id === user.id) {
              friendStatus = 'sent'; // 내가 보낸 요청
            } else {
              friendStatus = 'received'; // 받은 요청
            }
          }
        }

        return {
          ...userData,
          friend_status: friendStatus,
          is_friend: friendStatus === 'accepted'
        };
      });

      setUsers(usersWithFriendStatus);
      console.log('✅ Users with friend status set');
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // 오류 발생 시 테스트 데이터 사용
      console.log('🧪 Using test data due to catch error');
      setUsers([
        {
          id: 'test1',
          name: 'Test User 1',
          email: 'test1@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          friend_status: 'none',
          is_friend: false
        },
        {
          id: 'test2',
          name: 'Test User 2', 
          email: 'test2@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          friend_status: 'none',
          is_friend: false
        }
      ] as UserWithFriendStatus[]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    
    try {
      console.log('📤 Sending friend request to:', friendId);
      
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      // UI 업데이트
      setUsers(prev => prev.map(u => 
        u.id === friendId 
          ? { ...u, friend_status: 'sent' }
          : u
      ));
      
      console.log('✅ Friend request sent');
    } catch (error) {
      console.error('❌ Error sending friend request:', error);
    }
  };

  const respondToFriendRequest = async (friendId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;
    
    try {
      console.log(`📥 Responding to friend request from ${friendId} with:`, status);
      
      const { error } = await supabase
        .from('friendships')
        .update({
          status,
          responded_at: new Date().toISOString()
        })
        .eq('user_id', friendId)
        .eq('friend_id', user.id);

      if (error) throw error;

      // UI 업데이트
      setUsers(prev => prev.map(u => 
        u.id === friendId 
          ? { 
              ...u, 
              friend_status: status === 'accepted' ? 'accepted' : 'none',
              is_friend: status === 'accepted'
            }
          : u
      ));
      
      console.log('✅ Friend request response sent');
    } catch (error) {
      console.error('❌ Error responding to friend request:', error);
    }
  };

  const cancelFriendRequest = async (friendId: string) => {
    if (!user) return;
    
    try {
      console.log('❌ Canceling friend request to:', friendId);
      
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      if (error) throw error;

      // UI 업데이트
      setUsers(prev => prev.map(u => 
        u.id === friendId 
          ? { ...u, friend_status: 'none' }
          : u
      ));
      
      console.log('✅ Friend request canceled');
    } catch (error) {
      console.error('❌ Error canceling friend request:', error);
    }
  };

  const createChatRoom = async (otherUserId: string) => {
    if (!user) return;

    try {
      console.log('💬 Creating chat room with:', otherUserId);
      
      // 이미 채팅방이 있는지 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', [user.id])
        .contains('user_ids', [otherUserId])
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
          user_ids: [user.id, otherUserId]
        })
        .select()
        .single();

      if (error) throw error;

      // 새 채팅방으로 이동
      router.push(`/chat/${newRoom.id}`);
      console.log('✅ Chat room created and navigating');
    } catch (error) {
      console.error('❌ Error creating chat room:', error);
    }
  };

  useEffect(() => {
    // 인증 정보 로딩 중이거나, 로그아웃 상태이면 아무것도 하지 않음
    if (authLoading || !isAuthenticated || !user) {
      // 인증 로딩이 끝났지만, 로그아웃 상태이면 로그인 페이지로 리디렉션
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
      }
      return;
    }

    // 인증이 완료된 후, 필터 상태에 따라 사용자 목록 로드
    fetchUsers();
  }, [user, isAuthenticated, authLoading, filterBy, router]);

  const filteredUsers = users.filter(userData =>
    userData.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFriendButton = (userData: UserWithFriendStatus) => {
    switch (userData.friend_status) {
      case 'sent':
        return (
          <button
            onClick={() => cancelFriendRequest(userData.id)}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors flex items-center space-x-1"
          >
            <Clock className="h-3 w-3" />
            <span>대기중</span>
          </button>
        );
      case 'received':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => respondToFriendRequest(userData.id, 'accepted')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              수락
            </button>
            <button
              onClick={() => respondToFriendRequest(userData.id, 'rejected')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
            >
              거절
            </button>
          </div>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            친구
          </span>
        );
      default:
        return (
          <button
            onClick={() => sendFriendRequest(userData.id)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors flex items-center space-x-1"
          >
            <UserPlus className="h-3 w-3" />
            <span>친구 추가</span>
          </button>
        );
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">친구 찾기</h1>
          <p className="text-gray-600">다른 유학생들과 친구가 되어보세요</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBy === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterBy('school')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBy === 'school'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              같은 학교
            </button>
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="사용자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">사용자를 찾을 수 없습니다</h3>
                  <p className="mt-2 text-gray-600">
                    {searchTerm ? '검색어를 확인해주세요' : '아직 등록된 사용자가 없습니다'}
                  </p>
                </div>
              ) : (
                filteredUsers.map((userData) => (
                  <div key={userData.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {userData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{userData.name}</h3>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            {(userData as any).school && (
                              <div className="flex items-center space-x-1">
                                <GraduationCap className="h-4 w-4" />
                                <span>{(userData as any).school}</span>
                              </div>
                            )}
                            {(userData as any).major && (
                              <div className="flex items-center space-x-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{(userData as any).major}</span>
                              </div>
                            )}
                            {(userData as any).location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{(userData as any).location}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatRelativeTime(userData.created_at)} 가입</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {renderFriendButton(userData)}
                        <button
                          onClick={() => createChatRoom(userData.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>채팅</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 