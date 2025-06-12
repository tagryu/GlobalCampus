import Link from 'next/link';
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  ShoppingBag, 
  Globe,
  Heart,
  ArrowRight,
  Star
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: MessageCircle,
      title: '커뮤니티',
      description: '학교별, 지역별 게시판에서 자유롭게 소통하세요',
      href: '/posts',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Users,
      title: '친구 만들기',
      description: '같은 관심사를 가진 유학생 친구들을 만나보세요',
      href: '/users',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Calendar,
      title: '이벤트',
      description: '유학생 모임과 행사 정보를 확인하고 참여하세요',
      href: '/events',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: ShoppingBag,
      title: '중고거래',
      description: '안전하고 편리한 중고 물품 거래를 경험하세요',
      href: '/posts?category=marketplace',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const testimonials = [
    {
      name: '김민수',
      country: '중국',
      school: '서울대학교',
      content: 'GlobalCampus 덕분에 한국 생활 적응이 훨씬 쉬워졌어요. 많은 도움을 받았습니다!'
    },
    {
      name: 'Sarah Johnson',
      country: '미국',
      school: '연세대학교',
      content: '다양한 국적의 친구들을 만날 수 있어서 너무 좋아요. 한국어 공부에도 많은 도움이 되었습니다.'
    },
    {
      name: '田中太郎',
      country: '일본',
      school: '고려대학교',
      content: '중고거래 기능이 정말 유용해요. 안전하게 필요한 물건들을 구할 수 있어서 만족합니다.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Globe className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              외국인 유학생을 위한
              <br />
              <span className="text-yellow-300">글로벌 커뮤니티</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              정보 공유, 친구 만들기, 중고거래까지
              <br />
              한국 생활의 모든 것을 함께 해요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/posts"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                커뮤니티 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              GlobalCampus의 주요 기능
            </h2>
            <p className="text-xl text-gray-600">
              유학생 생활에 필요한 모든 기능을 한 곳에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">활성 유학생 회원</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">참여 대학교</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">게시글 & 정보 공유</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              유학생들의 실제 후기
            </h2>
            <p className="text-xl text-gray-600">
              GlobalCampus와 함께 한국 생활을 시작한 유학생들의 이야기
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.country} · {testimonial.school}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-6 text-red-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            GlobalCampus와 함께 더 풍요로운 유학생활을 만들어가세요
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            무료로 회원가입하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
