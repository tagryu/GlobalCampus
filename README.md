# GlobalCampus - 외국인 유학생 커뮤니티

외국인 유학생들을 위한 정보 공유, 커뮤니티 형성, 중고 거래, 모임/행사 플랫폼입니다.

## 🌟 주요 기능

- **커뮤니티**: 학교별, 지역별 게시판에서 자유롭게 소통
- **친구 찾기**: 관심사 기반 필터링으로 유학생 친구들과 연결
- **채팅**: 실시간 1:1 채팅 기능
- **이벤트**: 유학생 모임과 행사 정보 공유
- **중고거래**: 안전하고 편리한 중고 물품 거래
- **다국어 지원**: UI 다국어 지원 및 게시글 자동 번역

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **UI Components**: Lucide React, Radix UI

## 📋 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- Supabase 계정

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/globalcampus.git
cd globalcampus
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음과 같이 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DeepL API (번역 기능용)
DEEPL_API_KEY=your_deepl_api_key

# NextAuth Secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. `supabase/schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행하세요.
3. Supabase 프로젝트 설정에서 URL과 API Key를 복사해 환경 변수에 입력하세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
globalcampus/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   ├── posts/             # 게시글 관련 페이지
│   │   ├── chat/              # 채팅 페이지
│   │   ├── events/            # 이벤트 페이지
│   │   └── users/             # 사용자 관련 페이지
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   ├── ui/                # UI 컴포넌트
│   │   └── forms/             # 폼 컴포넌트
│   ├── hooks/                 # Custom React Hooks
│   ├── lib/                   # 유틸리티 함수 및 설정
│   ├── types/                 # TypeScript 타입 정의
│   └── styles/                # 스타일 파일
├── supabase/
│   ├── schema.sql             # 데이터베이스 스키마
│   └── functions/             # Edge Functions
└── public/                    # 정적 파일
```

## 🔧 주요 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 체크
```

## 🗄️ 데이터베이스 스키마

주요 테이블:
- `users`: 사용자 정보
- `posts`: 게시글
- `comments`: 댓글
- `chat_rooms`: 채팅방
- `messages`: 메시지
- `events`: 이벤트
- `reports`: 신고

자세한 스키마는 `supabase/schema.sql` 파일을 참조하세요.

## 📱 주요 페이지

- `/`: 홈페이지
- `/login`: 로그인
- `/signup`: 회원가입
- `/posts`: 커뮤니티 (게시글 목록)
- `/posts/create`: 게시글 작성
- `/posts/[id]`: 게시글 상세보기
- `/chat`: 채팅 목록
- `/chat/[id]`: 채팅방
- `/events`: 이벤트 목록
- `/users`: 사용자 목록 (친구 찾기)
- `/profile`: 프로필

## 🔐 인증

Supabase Auth를 사용하여 다음 인증 방식을 지원합니다:
- 이메일/비밀번호
- 구글 소셜 로그인 (추후 구현)

## 🌍 다국어 지원

- 한국어 (기본)
- 영어 (추후 구현)
- 중국어 (추후 구언)
- 일본어 (추후 구현)

## 🚀 배포

### Vercel 배포

1. GitHub에 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com)에서 프로젝트를 가져옵니다.
3. 환경 변수를 설정합니다.
4. 배포합니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**GlobalCampus** - 외국인 유학생들을 위한 글로벌 커뮤니티 🌍
