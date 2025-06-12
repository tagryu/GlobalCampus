const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gngzhykjlwuyzdgtsuht.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZ3poeWtqbHd1eXpkZ3RzdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTk2NTMsImV4cCI6MjA2NTE5NTY1M30.RlCshflq_TDD4OaZKQG4YECvQlGRB56NFTesmlmiXec'
);

async function checkDatabase() {
  console.log('🔍 Checking database state...');
  
  try {
    // 1. Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    console.log('👥 Users table:', users?.length || 0, 'records');
    if (usersError) console.log('❌ Users error:', usersError);
    if (users) console.log('Users sample:', users);
    
    // 2. Check auth users
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Current auth user:', authData?.user?.id || 'none');
    if (authError) console.log('❌ Auth error:', authError);
    
    // 3. Test RLS policies - try to insert without auth
    console.log('🧪 Testing RLS policies...');
    const { data: testInsert, error: testError } = await supabase
      .from('users')
      .insert({
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Test User',
        email: 'test@example.com'
      });
    
    if (testError) {
      console.log('✅ RLS is working - insert blocked:', testError.message);
    } else {
      console.log('❌ RLS might not be working - insert succeeded');
    }
    
    // 4. Check if we need to disable email confirmation
    console.log('📧 Testing signup without email confirmation...');
    const testEmail = 'test' + Date.now() + '@example.com';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signupError) {
      console.log('❌ Signup error:', signupError);
    } else {
      console.log('✅ Signup successful:', signupData.user?.id);
      console.log('📧 Email confirmation required:', !signupData.session);
    }
    
  } catch (error) {
    console.error('💥 Error during database check:', error);
  }
}

checkDatabase(); 