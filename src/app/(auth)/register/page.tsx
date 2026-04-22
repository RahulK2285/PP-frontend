'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import type { AppDispatch, RootState } from '@/store/store';
import { registerUser, clearError } from '@/store/authSlice';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) router.replace('/dashboard');
  }, [token, router]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, email, password, leetcodeUsername }));
    if (registerUser.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };

  const inputStyle = {
    background: 'var(--color-bg-input)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-purple)';
    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.25)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="glass-card p-10 animate-fade-in" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(124, 58, 237, 0.15)' }}>
      <div className="flex items-center gap-2.5 mb-7">
        <span className="text-2xl" style={{ color: 'var(--color-purple)', filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.25))' }}>◈</span>
        <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>PrepForge</span>
      </div>

      <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--color-text-heading)' }}>Create account</h1>
      <p className="text-sm mb-7" style={{ color: 'var(--color-text-secondary)' }}>Start your placement prep journey today</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Arjun Sharma" required minLength={2}
            className="w-full px-3.5 py-3 rounded-lg text-sm outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="w-full px-3.5 py-3 rounded-lg text-sm outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>LeetCode Username</label>
          <input type="text" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)}
            placeholder="your_leetcode_id"
            className="w-full px-3.5 py-3 rounded-lg text-sm outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters" required minLength={6}
              className="w-full px-3.5 py-3 pr-11 rounded-lg text-sm outline-none transition-all duration-200"
              style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-colors"
              style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0 }}
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-purple-dim) 100%)', boxShadow: '0 2px 10px rgba(124,58,237,0.25)' }}>
          <span>{loading ? 'Creating account...' : 'Create Account'}</span>
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {error && <p className="text-sm text-center" style={{ color: 'var(--color-red)' }}>{error}</p>}
      </form>

      <p className="text-center mt-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold" style={{ color: 'var(--color-purple)' }}>Sign in</Link>
      </p>
    </div>
  );
}
