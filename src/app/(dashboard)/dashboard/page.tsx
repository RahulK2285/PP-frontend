'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchAnalytics, fetchProblems } from '@/store/dsaSlice';
import { fetchReferrals } from '@/store/referralSlice';
import Heatmap from '@/components/charts/Heatmap';
import { TOPIC_COLORS, formatRelativeTime } from '@/lib/utils';
import { ArrowRight, Check, TrendingUp, Target, Zap } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { analytics, problems } = useSelector((state: RootState) => state.dsa);
  const { referrals } = useSelector((state: RootState) => state.referral);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchReferrals());
    dispatch(fetchProblems({}));
  }, [dispatch]);

  const totalSolved = analytics?.statusCounts?.Solved || 0;
  const totalProblems = analytics?.totalProblems || 0;
  const successRate = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const interviewsSet = referrals.filter(r => r.status === 'Interview Set').length;

  // Topic strength data
  const topicEntries = analytics?.topicCounts
    ? Object.entries(analytics.topicCounts)
      .map(([topic, counts]) => ({
        topic,
        total: counts.solved + counts.attempted + counts.todo,
        solved: counts.solved,
      }))
      .filter(t => t.total > 0)
      .sort((a, b) => b.solved - a.solved)
    : [];

  const maxSolved = Math.max(...topicEntries.map(t => t.solved), 1);

  // Recently solved problems (last 5)
  const recentlySolved = [...problems]
    .filter(p => p.status === 'Solved')
    .sort((a, b) => new Date(b.solvedAt || b.updatedAt).getTime() - new Date(a.solvedAt || a.updatedAt).getTime())
    .slice(0, 5);

  // Quick stats
  const weeklyCount = analytics?.weeklyData?.[analytics.weeklyData.length - 1]?.count || 0;
  const streakDays = analytics?.streak?.current || 0;

  // Navigate to DSA tracker filtered by topic
  const handleTopicClick = (topic: string) => {
    router.push(`/dsa-tracker?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Problems Solved */}
        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg stat-card-purple cursor-pointer"
          onClick={() => router.push('/dsa-tracker')}
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>PROBLEMS SOLVED</div>
          <div className="text-4xl font-black tracking-tight leading-none mb-1.5" style={{ color: 'var(--color-text-heading)' }}>{totalSolved}</div>
          <div className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <TrendingUp size={12} /> +{weeklyCount} this week · {totalProblems} total
          </div>
        </div>

        {/* Success Rate */}
        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg stat-card-green cursor-pointer"
          onClick={() => router.push('/analytics')}
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>SUCCESS RATE</div>
          <div className="text-4xl font-black tracking-tight leading-none mb-1.5" style={{ color: 'var(--color-text-heading)' }}>{successRate}%</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Easy: {analytics?.difficultyCounts?.Easy || 0} · Med: {analytics?.difficultyCounts?.Medium || 0} · Hard: {analytics?.difficultyCounts?.Hard || 0}
          </div>
        </div>

        {/* Referrals */}
        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg stat-card-pink cursor-pointer"
          onClick={() => router.push('/referrals')}
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>REFERRALS</div>
          <div className="text-4xl font-black tracking-tight leading-none mb-1.5" style={{ color: 'var(--color-text-heading)' }}>{referrals.length}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{interviewsSet} interview{interviewsSet !== 1 ? 's' : ''} scheduled</div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <button onClick={() => router.push('/dsa-tracker')}
          className="flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
            <Target size={20} style={{ color: 'var(--color-purple)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>Add Problem</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Track a new DSA problem</div>
          </div>
        </button>

        <button onClick={() => router.push('/recommendations')}
          className="flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <Zap size={20} style={{ color: 'var(--color-green)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>Get Recommendations</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Find your weak areas</div>
          </div>
        </button>

        <button onClick={() => router.push('/referrals')}
          className="flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.1)' }}>
            <ArrowRight size={20} style={{ color: 'var(--color-pink)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>Request Referral</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Apply for a company referral</div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Heatmap — spans 2 cols */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>ACTIVITY HEATMAP</h2>
          <Heatmap data={analytics?.heatmapData || {}} />
        </div>

        {/* Recently Solved — right column */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-4 uppercase flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <Check size={14} style={{ stroke: 'var(--color-green)' }} />
            RECENTLY SOLVED
          </h2>
          {recentlySolved.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentlySolved.map((p) => (
                <div key={p._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleTopicClick(p.topic)}
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-green)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--color-green)' }}>
                      <Check size={10} color="#fff" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold truncate max-w-[160px]" style={{ color: 'var(--color-text-heading)' }}>{p.title}</div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.topic}</div>
                    </div>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {formatRelativeTime(p.solvedAt || p.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No solved problems yet
            </p>
          )}
        </div>

        {/* Topic Strength — clickable bars */}
        <div className="lg:col-span-3 rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            ◈ TOPIC STRENGTH <span className="text-[10px] font-normal normal-case">(click a topic to view problems)</span>
          </h2>
          <div className="flex flex-col gap-3.5">
            {topicEntries.length > 0 ? topicEntries.map((entry) => (
              <div key={entry.topic}
                className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:translate-x-1"
                onClick={() => handleTopicClick(entry.topic)}>
                <span className="w-28 text-sm font-medium text-right shrink-0 group-hover:font-bold transition-all duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}>{entry.topic}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-surface)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(entry.solved / maxSolved) * 100}%`,
                      background: `linear-gradient(90deg, ${TOPIC_COLORS[entry.topic] || '#7c3aed'}, ${TOPIC_COLORS[entry.topic] || '#a78bfa'}80)`,
                      minWidth: '2px',
                    }}
                  />
                </div>
                <span className="w-10 text-xs font-semibold text-right" style={{ color: 'var(--color-text-muted)' }}>{entry.solved}</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-purple)' }} />
              </div>
            )) : (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No problems solved yet. Start solving to see your topic strength!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}