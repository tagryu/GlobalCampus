-- ================================================================
-- 임시 RLS 비활성화 (테스트용)
-- ================================================================

-- 경고: 이것은 개발/테스트 환경에서만 사용하세요!
-- 운영 환경에서는 절대 사용하지 마세요!

-- messages 테이블 RLS 임시 비활성화
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- chat_rooms 테이블 RLS 임시 비활성화
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;

-- users 테이블 RLS 임시 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 현재 RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chat_rooms', 'messages');

-- 테스트 후 다시 활성화하려면 아래 SQL 실행:
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;  
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY; 