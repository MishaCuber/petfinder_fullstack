import axios from 'axios';
// import { Post, User, Comment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.status === 500) {
      error.message = 'Внутренняя ошибка сервера';
    } else if (error.response?.status === 404) {
      error.message = 'Ресурс не найден';
    } else if (error.message === 'Network Error') {
      error.message = 'Ошибка сети. Проверьте подключение к интернету.';
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const postsAPI = {
  getPosts: (params?: any) => api.get('/posts', { params }),
  getPost: (id: string) => api.get(`/posts/${id}`),
  createPost: (postData: FormData) => api.post('/posts', postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updatePost: (id: string, postData: FormData) => api.put(`/posts/${id}`, postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  getUserPosts: () => api.get('/posts/user'),
};

export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData: FormData) => api.put('/users/profile', userData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getPosts: () => api.get('/admin/posts'),
  updatePost: (id: string, payload: Partial<{ title: string; description: string; location: string; petType: string; breed?: string; color?: string; size?: string; contactInfo: string; type: 'lost'|'found' }>) => api.patch(`/admin/posts/${id}`, payload),
  getComments: () => api.get('/admin/comments'),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  blockUser: (id: string, isBlocked: boolean) => api.patch(`/admin/users/${id}/status`, { isBlocked }),
  updatePostStatus: (id: string, status: 'active' | 'resolved' | 'closed') => api.patch(`/admin/posts/${id}/status`, { status }),
  deletePost: (id: string) => api.delete(`/admin/posts/${id}`),
  deleteComment: (id: string) => api.delete(`/admin/comments/${id}`),
};

export const commentsAPI = {
  getComments: (postId: string) => api.get(`/posts/${postId}/comments`),
  createComment: (postId: string, content: string) => api.post(`/posts/${postId}/comments`, { content }),
  updateComment: (id: string, content: string) => api.put(`/comments/${id}`, { content }),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
};

export const favoritesAPI = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (postId: string) => api.post(`/posts/${postId}/favorites`),
  removeFavorite: (postId: string) => api.delete(`/posts/${postId}/favorites`),
  checkFavorite: (postId: string) => api.get(`/posts/${postId}/favorites/check`),
};

export default api;