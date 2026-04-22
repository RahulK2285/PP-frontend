'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import type { AppDispatch, RootState } from '@/store/store';
import { loginUser, clearError } from '@/store/authSlice';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, error, token } = useSelector((state: RootState) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (token) router.replace('/dashboard');
    }, [token, router]);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(result)) {
            router.push('/dashboard');
        }
    };

    return (
        <div className="glass-card p-10 animate-fade-in" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(124, 58, 237, 0.15)' }}>
            <div className="flex items-center gap-2.5 mb-7">
                <span className="text-2xl" style={{ color: 'var(--color-purple)', filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.25))' }}>◈</span>
                <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>PrepForge</span>
            </div>

            <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--color-text-heading)' }}>Welcome back</h1>
            <p className="text-sm mb-7" style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue your preparation journey</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3.5 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-purple)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.25)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-border)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Password
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3.5 py-3 pr-10 rounded-lg text-sm outline-none transition-all duration-200"
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--color-purple)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.25)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--color-border)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />

                        {/* Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-60"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-purple-dim) 100%)',
                        boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                    }}
                >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    {!loading && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    )}
                </button>

                {error && <p className="text-sm text-center" style={{ color: 'var(--color-red)' }}>{error}</p>}
            </form>

            <p className="text-center mt-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold" style={{ color: 'var(--color-purple)' }}>Create one</Link>
            </p>
        </div>
    );
}
