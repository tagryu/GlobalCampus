import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          nationality: string | null;
          school: string | null;
          major: string | null;
          location: string | null;
          profile_image: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          nationality?: string | null;
          school?: string | null;
          major?: string | null;
          location?: string | null;
          profile_image?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          nationality?: string | null;
          school?: string | null;
          major?: string | null;
          location?: string | null;
          profile_image?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          images: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          content: string;
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          content?: string;
          images?: string[] | null;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          updated_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          user_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_ids: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_ids?: string[];
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chatroom_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chatroom_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          chatroom_id?: string;
          sender_id?: string;
          content?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          location: string;
          date: string;
          organizer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          location: string;
          date: string;
          organizer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          location?: string;
          date?: string;
          organizer_id?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          target_type: string;
          target_id: string;
          reporter_id: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_type: string;
          target_id: string;
          reporter_id: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_type?: string;
          target_id?: string;
          reporter_id?: string;
          reason?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company_name: string;
          description: string;
          location: string;
          job_type: 'full-time' | 'part-time' | 'internship' | 'contract';
          application_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company_name: string;
          description: string;
          location: string;
          job_type: 'full-time' | 'part-time' | 'internship' | 'contract';
          application_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company_name?: string;
          description?: string;
          location?: string;
          job_type?: 'full-time' | 'part-time' | 'internship' | 'contract';
          application_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}; 