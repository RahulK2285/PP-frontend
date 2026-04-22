'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState, AppDispatch } from '@/store/store';
import { logout, updateProfile } from '@/store/authSlice';
import { getInitials } from '@/lib/utils';
import { LayoutDashboard, ClipboardCheck, BarChart3, FileText, Users, HelpCircle, LogOut, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dsa-tracker', label: 'DSA Tracker', icon: ClipboardCheck },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/resume', label: 'Resume', icon: FileText },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/recommendations', label: 'Recommendations', icon: HelpCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  // Profile edit state
  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editLeetcode, setEditLeetcode] = useState(user?.leetcodeUsername || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await dispatch(updateProfile({ name: editName, leetcodeUsername: editLeetcode }));
    setSaving(false);
    setShowProfile(false);
  };

  const initials = user?.name ? getInitials(user.name) : '??';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <nav
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--color-bg-sidebar)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-2xl" style={{ color: 'var(--color-purple)', filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.25))' }}>◈</span>
          <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>PrepForge</span>
        </div>

        {/* Nav Links */}
        <ul className="flex-1 overflow-y-auto px-2.5 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href} className="mb-0.5">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? '#a78bfa' : 'var(--color-text-secondary)',
                    background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-purple)' : '3px solid transparent',
                    paddingLeft: isActive ? '13px' : '16px',
                  }}
                >
                  <Icon size={20} style={{ stroke: isActive ? '#a78bfa' : undefined }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Card + Actions */}
        <div className="px-4 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => { setEditName(user?.name || ''); setEditLeetcode(user?.leetcodeUsername || ''); setShowProfile(true); }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            title="Click to edit profile"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white select-none"
              style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-pink))' }}>
              {initials}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user?.name || 'User'}</span>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{user?.role === 'admin' ? 'Admin' : 'Student'}</span>
            </div>
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => { setEditName(user?.name || ''); setEditLeetcode(user?.leetcodeUsername || ''); setShowProfile(true); }}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              title="Edit Profile"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-card-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Edit Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowProfile(false)}>
          <div className="rounded-xl w-full max-w-[420px] animate-fade-in"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>Edit Profile</h2>
              <button onClick={() => setShowProfile(false)} className="w-9 h-9 rounded flex items-center justify-center cursor-pointer"
                style={{ color: 'var(--color-text-secondary)' }}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 flex flex-col gap-4">
              {/* Avatar preview */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-pink))' }}>
                  {editName ? getInitials(editName) : '??'}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>{editName || 'Your Name'}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required minLength={2}
                  className="w-full px-3.5 py-3 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>LeetCode Username</label>
                <input type="text" value={editLeetcode} onChange={(e) => setEditLeetcode(e.target.value)}
                  placeholder="your_leetcode_id"
                  className="w-full px-3.5 py-3 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Used for LeetCode auto-sync. Your solved problems will be imported automatically.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowProfile(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                  style={{ background: 'transparent', border: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
