import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import type { AuthState, User } from '@/types';

// ─── Thunks ───
export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('prepforge_token', res.data.token);
      localStorage.setItem('prepforge_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string; leetcodeUsername?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('prepforge_token', res.data.token);
      localStorage.setItem('prepforge_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { name?: string; leetcodeUsername?: string }, { rejectWithValue }) => {
    try {
      const res = await api.put('/auth/me', data);
      localStorage.setItem('prepforge_user', JSON.stringify(res.data));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Update failed');
    }
  }
);

// ─── Initial State ───
function getInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, token: null, loading: false, error: null };
  }
  const token = localStorage.getItem('prepforge_token');
  const userStr = localStorage.getItem('prepforge_user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { user, token, loading: false, error: null };
}

// ─── Slice ───
const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prepforge_token');
        localStorage.removeItem('prepforge_user');
      }
    },
    clearError(state) {
      state.error = null;
    },
    hydrateAuth(state) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('prepforge_token');
        const userStr = localStorage.getItem('prepforge_user');
        state.token = token;
        state.user = userStr ? JSON.parse(userStr) : null;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Profile
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { logout, clearError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
