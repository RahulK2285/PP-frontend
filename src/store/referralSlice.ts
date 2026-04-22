import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import type { Referral, ReferralStatus } from '@/types';

interface ReferralState {
  referrals: Referral[];
  loading: boolean;
  error: string | null;
}

export const fetchReferrals = createAsyncThunk('referral/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/referrals');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch referrals');
  }
});

export const createReferral = createAsyncThunk(
  'referral/create',
  async (data: { company: string; role: string; message: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/referrals', data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to submit referral');
    }
  }
);

export const updateReferralStatus = createAsyncThunk(
  'referral/updateStatus',
  async ({ id, status }: { id: string; status: ReferralStatus }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/referrals/${id}/status`, { status });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update status');
    }
  }
);

export const deleteReferral = createAsyncThunk('referral/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/referrals/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Delete failed');
  }
});

const referralSlice = createSlice({
  name: 'referral',
  initialState: { referrals: [], loading: false, error: null } as ReferralState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchReferrals.pending, (state) => { state.loading = true; });
    builder.addCase(fetchReferrals.fulfilled, (state, action) => { state.loading = false; state.referrals = action.payload; });
    builder.addCase(fetchReferrals.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(createReferral.fulfilled, (state, action) => { state.referrals.unshift(action.payload); });

    builder.addCase(updateReferralStatus.fulfilled, (state, action) => {
      const idx = state.referrals.findIndex(r => r._id === action.payload._id);
      if (idx !== -1) state.referrals[idx] = action.payload;
    });

    builder.addCase(deleteReferral.fulfilled, (state, action) => {
      state.referrals = state.referrals.filter(r => r._id !== action.payload);
    });
  },
});

export default referralSlice.reducer;
