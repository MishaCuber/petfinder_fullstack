export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  animalType: 'cat' | 'dog' | 'other';
  breed: string;
  location: string;
  photos: string[];
  dateLost: string;
  contactPhone: string;
  author: User;
  status: 'lost' | 'found';
  coordinates?: {
    lat: number;
    lng: number;
  };
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
  animalType?: string;
  location?: string;
  dateLost?: string;
  breed?: string;
  status?: string;
  page?: number;
  limit?: number;
}