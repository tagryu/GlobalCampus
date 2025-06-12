'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { User } from '@/types';
import { 
  ArrowLeft,
  Send,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  chatroom_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: User;
}

interface ChatRoom {
  id: string;
  user_ids: string[];
  created_at: string;
  updated_at: string;
}

export default function ChatRoomPage() {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chatRoomId = params?.id as string;

  // scrollToBottom 함수를 useCallback으로 정의
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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

  useEffect(() => {
    if (chatRoomId && user && isAuthenticated && authChecked) {
      fetchChatRoom();
      fetchMessages();
      
      // 실시간 메시지 구독
      const messageSubscription = supabase
        .channel(`chat_room_${chatRoomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chatroom_id=eq.${chatRoomId}`
          },
          (payload) => {
            fetchMessages(); // 새 메시지가 있으면 다시 로드
          }
        )
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
      };
    }
  }, [chatRoomId, user, isAuthenticated, authChecked]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 인증 체크 전이거나 로그인하지 않은 경우 로딩 표시
  if (authLoading || !authChecked || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? '인증 상태 확인 중...' : '로그인 페이지로 이동 중...'}
          </p>
        </div>
      </div>
    );
  }

  const fetchChatRoom = async () => {
    try {
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatRoomId)
        .single();

      if (error) throw error;

      // 사용자가 이 채팅방에 참여하고 있는지 확인
      if (!room.user_ids.includes(user.id)) {
        setError('이 채팅방에 접근할 권한이 없습니다.');
        return;
      }

      setChatRoom(room);

      // 상대방 정보 가져오기
      const otherUserId = room.user_ids.find((id: string) => id !== user.id);
      if (otherUserId) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single();
        
        if (userData) {
          setOtherUser(userData);
        }
      }
    } catch (error) {
      console.error('Error fetching chat room:', error);
      setError('채팅방을 불러올 수 없습니다.');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(*)
        `)
        .eq('chatroom_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    console.log('🚀 Sending message:', {
      chatRoomId,
      userId: user.id,
      content: messageText.trim(),
      messageLength: messageText.trim().length
    });

    setSending(true);
    try {
      // 메시지 전송
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chatroom_id: chatRoomId,
          sender_id: user.id,
          content: messageText.trim()
        })
        .select()
        .single();

      if (messageError) {
        console.error('❌ Message insert error:', messageError);
        throw messageError;
      }

      console.log('✅ Message sent successfully:', messageData);

      // 채팅방 업데이트 시간 갱신
      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatRoomId);

      if (updateError) {
        console.warn('⚠️ Chat room update error:', updateError);
        // 이 에러는 무시하고 계속 진행
      }

      setMessageText('');
      
      // 메시지 목록 새로고침
      await fetchMessages();
      
    } catch (error) {
      console.error('💥 Error sending message:', error);
      
      // 사용자에게 에러 메시지 표시
      if (error instanceof Error) {
        alert(`메시지 전송 실패: ${error.message}`);
      } else {
        alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !chatRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">채팅방을 찾을 수 없습니다</h3>
          <p className="mt-2 text-gray-600">{error || '존재하지 않는 채팅방입니다.'}</p>
          <Link
            href="/chat"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            채팅 메인으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/chat"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {otherUser?.name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {otherUser?.name || '알 수 없는 사용자'}
              </h1>
              <p className="text-sm text-gray-500">
                {(otherUser as any)?.school || '학교 정보 없음'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                대화를 시작해보세요!
              </div>
            ) : (
              messages.map((message) => {
                const isMyMessage = message.sender_id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMyMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isMyMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatRelativeTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="메시지를 입력하세요..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                style={{ minHeight: '48px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!sending && messageText.trim()) {
                      sendMessage(e);
                    }
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center min-h-[48px] ${
                !messageText.trim() || sending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 