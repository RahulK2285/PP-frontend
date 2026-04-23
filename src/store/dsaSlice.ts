import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import type { Problem, Analytics, SyncResult } from '@/types';

interface DSAState {
  problems: Problem[];
  analytics: Analytics | null;
  syncResult: SyncResult | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
}


export const fetchProblems = createAsyncThunk(
  'dsa/fetchProblems',
  async (
    filters: { topic?: string; difficulty?: string; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      if (filters.topic) params.set('topic', filters.topic);
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.status) params.set('status', filters.status);

      const res = await api.get(`/problems?${params.toString()}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch problems'
      );
    }
  }
);

export const createProblem = createAsyncThunk(
  'dsa/createProblem',
  async (data: Partial<Problem>, { rejectWithValue }) => {
    try {
      const res = await api.post('/problems', data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to create problem'
      );
    }
  }
);

export const updateProblem = createAsyncThunk(
  'dsa/updateProblem',
  async (
    { id, data }: { id: string; data: Partial<Problem> },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/problems/${id}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to update problem'
      );
    }
  }
);

export const deleteProblem = createAsyncThunk(
  'dsa/deleteProblem',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/problems/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to delete problem'
      );
    }
  }
);

export const syncLeetCode = createAsyncThunk(
  'dsa/syncLeetCode',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/problems/sync-leetcode');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'LeetCode sync failed'
      );
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'dsa/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/problems/analytics');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch analytics'
      );
    }
  }
);

// ─── Slice ───

const dsaSlice = createSlice({
  name: 'dsa',
  initialState: {
    problems: [],
    analytics: null,
    syncResult: null,
    loading: false,
    syncing: false,
    error: null,
  } as DSAState,
  reducers: {
    clearSyncResult(state) {
      state.syncResult = null;
    },
    clearDSAError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Problems
    builder.addCase(fetchProblems.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProblems.fulfilled, (state, action) => {
      state.loading = false;
      state.problems = action.payload;
    });
    builder.addCase(fetchProblems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Problem
    builder.addCase(createProblem.fulfilled, (state, action) => {
      state.problems.unshift(action.payload);
    });

    // Update Problem
    builder.addCase(updateProblem.fulfilled, (state, action) => {
      const idx = state.problems.findIndex(
        (p) => p._id === action.payload._id
      );
      if (idx !== -1) state.problems[idx] = action.payload;
    });

    // Delete Problem
    builder.addCase(deleteProblem.fulfilled, (state, action) => {
      state.problems = state.problems.filter(
        (p) => p._id !== action.payload
      );
    });

    // Sync LeetCode
    builder.addCase(syncLeetCode.pending, (state) => {
      state.syncing = true;
      state.error = null;
    });
    builder.addCase(syncLeetCode.fulfilled, (state, action) => {
      state.syncing = false;
      state.syncResult = action.payload;
    });
    builder.addCase(syncLeetCode.rejected, (state, action) => {
      state.syncing = false;
      state.error = action.payload as string;
    });

    // Analytics
    builder.addCase(fetchAnalytics.fulfilled, (state, action) => {
      state.analytics = action.payload;
    });
  },
});

export const { clearSyncResult, clearDSAError } = dsaSlice.actions;
export default dsaSlice.reducer;
