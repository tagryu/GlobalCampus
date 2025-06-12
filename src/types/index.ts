export interface User {
  id: string;
  email: string;
  name: string;
  nationality?: string;
  school?: string;
  major?: string;
  location?: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  user?: User;
  comments?: Comment[];
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ChatRoom {
  id: string;
  user_ids: string[];
  created_at: string;
  updated_at: string;
  users?: User[];
  last_message?: Message;
}

export interface Message {
  id: string;
  chatroom_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  organizer?: User;
}

export interface Report {
  id: string;
  target_type: 'post' | 'comment' | 'user';
  target_id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
}

export type PostCategory = 
  | 'general' 
  | 'question' 
  | 'event' 
  | 'marketplace' 
  | 'study' 
  | 'housing' 
  | 'job';

export interface CreatePostData {
  category: PostCategory;
  title: string;
  content: string;
  images?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  images?: string[];
  category?: PostCategory;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}

export interface UpdateUserData {
  name?: string;
  nationality?: string;
  school?: string;
  profile_image?: string;
  bio?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  date: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Job {
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
  poster?: User;
} 