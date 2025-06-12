-- ================================================================
-- 채팅 시스템 디버깅 SQL
-- ================================================================

-- 1. 현재 로그인한 사용자들 확인 (auth.users - 인증 테이블)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at IS NOT NULL as email_confirmed,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. public.users 테이블 확인 (프로필 정보)
SELECT 
    id,
    email,
    name,
    school,
    major,
    location,
    created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. 채팅방 목록 확인
SELECT 
    id,
    user_ids,
    created_at,
    updated_at,
    array_length(user_ids, 1) as user_count
FROM chat_rooms 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. 메시지 목록 확인
SELECT 
    m.id,
    m.chatroom_id,
    m.sender_id,
    u.name as sender_name,
    m.content,
    m.created_at
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id
ORDER BY m.created_at DESC 
LIMIT 20;

-- 5. RLS 정책 확인 (관리자용)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('chat_rooms', 'messages', 'users')
ORDER BY tablename, policyname;

-- 6. 특정 채팅방의 참여자 정보 (채팅방 ID를 실제 ID로 변경하세요)
-- SELECT 
--     cr.id as chatroom_id,
--     cr.user_ids,
--     u.id as user_id,
--     u.name as user_name,
--     u.email
-- FROM chat_rooms cr
-- CROSS JOIN unnest(cr.user_ids) as user_id
-- LEFT JOIN users u ON u.id = user_id::uuid
-- WHERE cr.id = 'YOUR_CHATROOM_ID_HERE';

-- 7. 테스트용 메시지 수동 삽입 (필요시 사용)
-- INSERT INTO messages (chatroom_id, sender_id, content) 
-- VALUES ('YOUR_CHATROOM_ID', 'YOUR_USER_ID', '테스트 메시지'); 