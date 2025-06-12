'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  MessageCircle, 
  MessageSquare,
  Calendar, 
  Users, 
  Briefcase,
  User, 
  LogOut, 
  Menu, 
  X,
  Globe
} from 'lucide-react';

export function Navbar() {
  const authHook = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 렌더링되도록 함 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 더 명확한 상태 체크
  const isLoading = authHook.loading;
  const hasUser = !!authHook.user;
  const userProfile = authHook.profile;

  const navigationItems = [
    { name: '커뮤니티', href: '/posts', icon: MessageCircle },
    { name: 'DM', href: '/chat', icon: MessageSquare },
    { name: '이벤트', href: '/events', icon: Calendar },
    { name: '친구 찾기', href: '/users', icon: Users },
    { name: '채용', href: '/jobs', icon: Briefcase },
  ];

  const handleSignOut = async () => {
    try {
      await authHook.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              GlobalCampus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu - 클라이언트에서만 렌더링 */}
          <div className="flex items-center space-x-4">
            {!mounted ? (
              // 서버 사이드 렌더링 시에는 빈 div (Hydration 에러 방지)
              <div className="w-20 h-8"></div>
            ) : isLoading ? (
              // 로딩 중
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                <span className="text-sm text-gray-500">로딩중...</span>
              </div>
            ) : hasUser ? (
              // 로그인된 경우
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block">
                    {userProfile?.name || authHook.user?.email || 'Profile'}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">로그아웃</span>
                </button>
              </div>
            ) : (
              // 로그인되지 않은 경우
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 