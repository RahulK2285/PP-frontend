'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { hydrateAuth } from '@/store/authSlice';
import { fetchAnalytics } from '@/store/dsaSlice';
import Sidebar from '@/components/ui/Sidebar';
import Topbar from '@/components/ui/Topbar';
import HelpBot from '@/components/ui/HelpBot';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { analytics } = useSelector((state: RootState) => state.dsa);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('prepforge_token');
      if (!storedToken) {
        router.replace('/login');
      }
    }
  }, [token, router]);

  useEffect(() => {
    if (token) {
      dispatch(fetchAnalytics());
    }
  }, [token, dispatch]);

  if (!token && typeof window !== 'undefined' && !localStorage.getItem('prepforge_token')) {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 lg:ml-60 px-4 lg:px-8 pb-8 min-h-screen">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          streak={analytics?.streak?.current || 0}
        />
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      <HelpBot />
    </div>
  );
}
