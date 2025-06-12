'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { User } from '@/types';
import { 
  MessageCircle,
  Plus,
  Search,
  Users,
  Clock,
  ChevronRight
} from 'lucide-react';

interface ChatRoom {
  id: string;
  user_ids: string[];
  created_at: string;
  updated_at: string;
  other_user?: User;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // 함수들을 useEffect보다 먼저 정의
  const fetchChatRooms = async () => {
    if (!user) {
      console.log('❌ No user for fetchChatRooms');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching chat rooms...');
      
      // 내가 참여한 채팅방 조회
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Chat rooms fetch error:', error);
        // 오류 시 빈 배열로 설정
        setChatRooms([]);
        setLoading(false);
        return;
      }

      console.log('✅ Chat rooms fetched:', rooms?.length || 0);

      // 각 채팅방의 상대방 정보와 마지막 메시지 가져오기
      const roomsWithDetails = await Promise.all(
        (rooms || []).map(async (room) => {
          try {
            // 상대방 ID 찾기
            const otherUserId = room.user_ids.find((id: string) => id !== user.id);
            
            let otherUser = null;
            if (otherUserId) {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', otherUserId)
                .single();
              otherUser = userData;
            }

            // 마지막 메시지 가져오기
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('*')
              .eq('chatroom_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...room,
              other_user: otherUser,
              last_message: lastMessage
            };
          } catch (error) {
            console.error('Error processing room:', room.id, error);
            return {
              ...room,
              other_user: null,
              last_message: null
            };
          }
        })
      );

      setChatRooms(roomsWithDetails);
      console.log('✅ Chat rooms with details set');
    } catch (error) {
      console.error('❌ Error fetching chat rooms:', error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!user) {
      console.log('❌ No user for fetchUsers');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching users for new chat...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id) // 자신 제외
        .order('name')
        .limit(20); // 성능을 위해 제한

      if (error) {
        console.error('Users fetch error:', error);
        setUsers([]);
      } else {
        console.log('✅ Users fetched:', data?.length || 0);
        setUsers(data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
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

    // 인증이 완료된 후, 현재 활성화된 탭에 따라 데이터 로드
    if (activeTab === 'chats') {
      fetchChatRooms();
    } else {
      fetchUsers();
    }
  }, [user, isAuthenticated, authLoading, activeTab, router]);

  // 간단한 로딩 체크
  if (authLoading || loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  const createChatRoom = async (otherUserId: string) => {
    if (!user) return;

    try {
      // 이미 채팅방이 있는지 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', [user.id])
        .contains('user_ids', [otherUserId])
        .single();

      if (existingRoom) {
        // 기존 채팅방으로 이동
        window.location.href = `/chat/${existingRoom.id}`;
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
      window.location.href = `/chat/${newRoom.id}`;
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const filteredItems = activeTab === 'chats' 
    ? chatRooms.filter(room => 
        room.other_user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users.filter((userData: User) => 
        userData.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DM (Direct Messages)</h1>
          <p className="text-gray-600">다른 유학생들과 1:1로 대화해보세요</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('chats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="h-4 w-4 inline mr-2" />
                DM 목록
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                새 DM
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={activeTab === 'chats' ? '채팅방 검색...' : '사용자 검색...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  {activeTab === 'chats' ? (
                    <>
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">DM이 없습니다</h3>
                      <p className="mt-2 text-gray-600">새 DM 탭에서 다른 사용자와 대화를 시작해보세요!</p>
                    </>
                  ) : (
                    <>
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">사용자를 찾을 수 없습니다</h3>
                      <p className="mt-2 text-gray-600">검색어를 확인해주세요</p>
                    </>
                  )}
                </div>
              ) : activeTab === 'chats' ? (
                // 채팅방 목록
                (filteredItems as ChatRoom[]).map((room) => (
                  <Link
                    key={room.id}
                    href={`/chat/${room.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {room.other_user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {room.other_user?.name || '알 수 없는 사용자'}
                            </h3>
                          </div>
                          {room.last_message ? (
                            <p className="text-sm text-gray-600 truncate">
                              {room.last_message.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">메시지가 없습니다</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {room.last_message && (
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(room.last_message.created_at)}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // 사용자 목록
                (filteredItems as User[]).map((userData) => (
                  <div key={userData.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {userData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{userData.name}</h3>
                          <p className="text-sm text-gray-600">{(userData as any).school || '학교 정보 없음'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => createChatRoom(userData.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>채팅</span>
                      </button>
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