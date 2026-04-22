import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dsaReducer from './dsaSlice';
import resumeReducer from './resumeSlice';
import referralReducer from './referralSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dsa: dsaReducer,
    resume: resumeReducer,
    referral: referralReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
