-- ================================================================
-- CLEANUP UNCONFIRMED USERS (개발용)
-- ================================================================

-- 미확인 상태의 auth.users 삭제 (cascading으로 public.users도 함께 삭제됨)
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL 
AND created_at < NOW() - INTERVAL '1 hour';

-- 결과 확인
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users; 