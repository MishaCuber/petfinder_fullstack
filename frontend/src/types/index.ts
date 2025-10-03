export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  isBlocked?: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  petType: string;
  breed?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  location: string;
  contactInfo: string;
  photos: string[];
  author: User;
  status: 'active' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  _id: string;
  user: string;
  post: Post;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null; // Добавляем поле для ошибок
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface CommentsState {
  comments: Comment[];
  loading: boolean;
}

export interface Filters {
  petType?: string;
  location?: string;
  breed?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}