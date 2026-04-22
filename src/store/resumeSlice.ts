import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import type { Resume } from '@/types';

interface ResumeState {
  resumes: Resume[];
  loading: boolean;
  uploading: boolean;
  scoring: string | null; // ID of resume being rescored
  error: string | null;
}

export const fetchResumes = createAsyncThunk('resume/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/resumes');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch resumes');
  }
});

export const uploadResume = createAsyncThunk('resume/upload', async (file: File, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Upload failed');
  }
});

export const deleteResume = createAsyncThunk('resume/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/resumes/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Delete failed');
  }
});

export const rescoreResume = createAsyncThunk('resume/rescore', async (id: string, { rejectWithValue }) => {
  try {
    const res = await api.post(`/resumes/${id}/rescore`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Rescore failed');
  }
});

const resumeSlice = createSlice({
  name: 'resume',
  initialState: { resumes: [], loading: false, uploading: false, scoring: null, error: null } as ResumeState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchResumes.pending, (state) => { state.loading = true; });
    builder.addCase(fetchResumes.fulfilled, (state, action) => { state.loading = false; state.resumes = action.payload; });
    builder.addCase(fetchResumes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(uploadResume.pending, (state) => { state.uploading = true; });
    builder.addCase(uploadResume.fulfilled, (state, action) => { state.uploading = false; state.resumes.unshift(action.payload); });
    builder.addCase(uploadResume.rejected, (state, action) => { state.uploading = false; state.error = action.payload as string; });

    builder.addCase(deleteResume.fulfilled, (state, action) => {
      state.resumes = state.resumes.filter(r => r._id !== action.payload);
    });

    builder.addCase(rescoreResume.pending, (state, action) => { state.scoring = action.meta.arg; });
    builder.addCase(rescoreResume.fulfilled, (state, action) => {
      state.scoring = null;
      const idx = state.resumes.findIndex(r => r._id === action.payload._id);
      if (idx !== -1) state.resumes[idx] = action.payload;
    });
    builder.addCase(rescoreResume.rejected, (state) => { state.scoring = null; });
  },
});

export default resumeSlice.reducer;
