'use client';

import Link from 'next/link';
import { Wrench, ArrowLeft } from 'lucide-react';

export default function CreateEventPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white p-12 rounded-lg shadow-lg">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
          <Wrench className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          기능 준비 중입니다
        </h1>
        <p className="text-gray-600 mb-8">
          보다 나은 이벤트 등록 기능을 제공하기 위해 열심히 개발하고 있습니다.
          조금만 기다려주세요!
        </p>
        <Link
          href="/events"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          이벤트 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 