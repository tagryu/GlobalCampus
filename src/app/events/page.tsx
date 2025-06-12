'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import type { User } from '@/types';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  CalendarDays,
  User as UserIcon
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  organizer?: User;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [authChecked, setAuthChecked] = useState(false);
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
        if (!isAuthenticated) {
          console.log('🚫 Not authenticated, redirecting to login');
          router.push('/login');
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user && isAuthenticated && authChecked) {
      fetchEvents();
    }
  }, [user, filterBy, isAuthenticated, authChecked]);

  // 인증 체크 전이거나 로그인하지 않은 경우 로딩 표시
  if (authLoading || !authChecked || !isAuthenticated) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">
            {authLoading ? '로딩 중...' : '페이지 준비 중...'}
          </p>
        </div>
      </div>
    );
  }

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:users(*)
        `);

      // 필터 적용
      const now = new Date().toISOString();
      if (filterBy === 'upcoming') {
        query = query.gte('date', now);
      } else if (filterBy === 'past') {
        query = query.lt('date', now);
      }

      const { data, error } = await query.order('date', { ascending: filterBy === 'past' ? false : true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      day: date.toLocaleDateString('ko-KR', { weekday: 'long' })
    };
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">이벤트 & 모임</h1>
              <p className="text-gray-600">유학생들과 함께하는 다양한 이벤트와 모임에 참여해보세요</p>
            </div>
            <Link
              href="/events/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>이벤트 만들기</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="이벤트 제목, 설명, 장소로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBy === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterBy('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBy === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              예정된 이벤트
            </button>
            <button
              onClick={() => setFilterBy('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBy === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              지난 이벤트
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-2xl font-bold text-blue-600">{filteredEvents.length}개</span>
                <p className="text-sm text-gray-600">이벤트</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-600">
                  {filteredEvents.filter(e => isUpcoming(e.date)).length}개
                </span>
                <p className="text-sm text-gray-600">예정된 이벤트</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm ? '검색 결과가 없습니다' : '아직 등록된 이벤트가 없습니다'}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchTerm ? '다른 검색어로 시도해보세요' : '첫 번째 이벤트를 만들어보세요!'}
              </p>
              {!searchTerm && (
                <Link
                  href="/events/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  이벤트 만들기
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const eventDate = formatEventDate(event.date);
                const upcoming = isUpcoming(event.date);
                
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          {upcoming && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              예정
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>{eventDate.date} ({eventDate.day})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{eventDate.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          {event.organizer && (
                            <div className="flex items-center space-x-1">
                              <UserIcon className="h-4 w-4" />
                              <span>주최: {event.organizer.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(event.created_at)} 생성
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 