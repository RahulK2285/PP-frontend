'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchReferrals, createReferral, updateReferralStatus, deleteReferral } from '@/store/referralSlice';
import { formatDate } from '@/lib/utils';
import type { ReferralStatus } from '@/types';
import { Check, Trash2 } from 'lucide-react';

const STEPS: { label: string; status: ReferralStatus }[] = [
  { label: 'Applied', status: 'Applied' },
  { label: 'Under Review', status: 'Under Review' },
  { label: 'Referral Sent', status: 'Referral Sent' },
  { label: 'Interview Set', status: 'Interview Set' },
];

function getStepIndex(status: ReferralStatus): number {
  const idx = STEPS.findIndex(s => s.status === status);
  return idx >= 0 ? idx : 0;
}

function getStatusBadge(status: ReferralStatus) {
  const map: Record<string, { bg: string; color: string }> = {
    'Applied': { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-amber)' },
    'Under Review': { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-blue)' },
    'Referral Sent': { bg: 'rgba(34,197,94,0.1)', color: 'var(--color-green)' },
    'Interview Set': { bg: 'rgba(124,58,237,0.1)', color: 'var(--color-purple)' },
    'Rejected': { bg: 'rgba(239,68,68,0.1)', color: 'var(--color-red)' },
  };
  return map[status] || map['Applied'];
}

export default function ReferralsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { referrals, loading } = useSelector((state: RootState) => state.referral);
  const [form, setForm] = useState({ company: '', role: '', message: '' });

  useEffect(() => { dispatch(fetchReferrals()); }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createReferral(form));
    setForm({ company: '', role: '', message: '' });
  };

  const inputStyle = {
    background: 'var(--color-bg-input)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-wide mb-6" style={{ color: 'var(--color-text-heading)' }}>◈ REFERRAL REQUESTS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Request Form */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>Request a Referral</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Google, Microsoft" required
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Role</label>
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. SDE-1, SDE Intern" required
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Brief intro and why you're a good fit..." required rows={4}
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none resize-y min-h-[100px]" style={inputStyle as any} />
            </div>
            <button type="submit" className="w-full py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))' }}>
              Submit Request
            </button>
          </form>
        </div>

        {/* Referral List */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>My Referrals</h2>
          {loading ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          ) : referrals.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No referral requests yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {referrals.map((ref) => {
                const currentStep = getStepIndex(ref.status);
                const badge = getStatusBadge(ref.status);

                return (
                  <div key={ref._id} className="p-4 rounded-lg transition-colors duration-200"
                    style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>{ref.company}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{ref.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                          {ref.status.toUpperCase()}
                        </span>
                        <button onClick={() => dispatch(deleteReferral(ref._id))} className="w-7 h-7 rounded flex items-center justify-center cursor-pointer"
                          style={{ color: 'var(--color-red)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Status Stepper */}
                    {ref.status !== 'Rejected' && (
                      <div className="flex items-center gap-0 mt-3 mb-2">
                        {STEPS.map((step, i) => (
                          <div key={step.status} className="flex items-center">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => dispatch(updateReferralStatus({ id: ref._id, status: step.status }))}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 cursor-pointer"
                                style={{
                                  border: `2px solid ${i <= currentStep ? (i < currentStep ? 'var(--color-green)' : 'var(--color-purple)') : 'var(--color-border-light)'}`,
                                  background: i < currentStep ? 'var(--color-green)' : i === currentStep ? 'var(--color-purple)' : 'transparent',
                                  color: i <= currentStep ? '#fff' : 'var(--color-text-muted)',
                                }}
                              >
                                {i < currentStep ? <Check size={12} /> : i + 1}
                              </button>
                              <span className="text-[10px] font-semibold text-center w-16"
                                style={{ color: i < currentStep ? 'var(--color-green)' : i === currentStep ? 'var(--color-purple)' : 'var(--color-text-muted)' }}>
                                {step.label}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className="w-8 h-0.5 mx-1 mt-[-16px]"
                                style={{ background: i < currentStep ? 'var(--color-green)' : 'var(--color-border-light)' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDate(ref.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
