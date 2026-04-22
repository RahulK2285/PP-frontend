'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getGreeting } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
  streak?: number;
}

export default function Topbar({ onToggleSidebar, streak = 0 }: TopbarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <header
      className="flex items-center justify-between h-16 sticky top-0 z-30 mb-2"
      style={{
        background: 'rgba(6, 6, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-md flex items-center justify-center lg:hidden cursor-pointer transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Menu size={22} />
        </button>
        <div className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {getGreeting()},{' '}
          <span className="font-bold" style={{ color: 'var(--color-purple)' }}>{firstName}</span> 👋
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
            }}>
            <span className="text-base">🔥</span>
            <span className="font-extrabold">{streak}</span>-day streak
          </div>
        )}
        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))' }}>
          {user?.role === 'admin' ? 'ADMIN' : 'STUDENT'}
        </span>
      </div>
    </header>
  );
}
