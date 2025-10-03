import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, PostsState, Filters } from '../../types';
import { postsAPI } from '../../services/api';

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  totalPages: 1,
  currentPage: 1,
  total: 0,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (filters: Filters = {}, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPosts(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPost(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: FormData, { rejectWithValue }) => {
    try {
      const response = await postsAPI.createPost(postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, postData }: { id: string; postData: FormData }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.updatePost(id, postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      await postsAPI.deletePost(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getUserPosts();
      return response.data as Post[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.loading = false;
      })
      // Fetch Post
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.currentPost = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        console.error('Create post error:', action.payload);
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        state.currentPost = action.payload;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        console.error('Update post error:', action.payload);
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      // Fetch current user's posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.loading = false;
        state.posts = action.payload;
        state.totalPages = 1;
        state.currentPage = 1;
        state.total = action.payload.length;
      })
      .addCase(fetchUserPosts.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;