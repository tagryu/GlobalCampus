// 브라우저 개발자 도구 콘솔에서 실행할 수 있는 스크립트
// 인증 관련 캐시를 모두 정리합니다

console.log('🧹 인증 캐시 정리 시작...');

// Supabase 관련 로컬 스토리지 정리
const supabaseKeys = Object.keys(localStorage).filter(key => 
  key.includes('supabase') || 
  key.includes('sb-') ||
  key.includes('auth')
);

supabaseKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ 제거됨: ${key}`);
});

// 세션 스토리지도 정리
const sessionKeys = Object.keys(sessionStorage).filter(key => 
  key.includes('supabase') || 
  key.includes('sb-') ||
  key.includes('auth')
);

sessionKeys.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`🗑️ 세션에서 제거됨: ${key}`);
});

console.log('✅ 인증 캐시 정리 완료!');
console.log('💡 페이지를 새로고침하세요.');

// 자동으로 페이지 새로고침
setTimeout(() => {
  window.location.reload();
}, 2000); 