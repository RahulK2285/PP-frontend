'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchAnalytics } from '@/store/dsaSlice';
import { TOPIC_COLORS } from '@/lib/utils';
import type { TopicCount } from '@/types';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { analytics } = useSelector((state: RootState) => state.dsa);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (!analytics) {
    return <div className="text-center py-20 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</div>;
  }

  // Topic distribution data — full names, sorted by solved count
  const topicData = (Object.entries(analytics.topicCounts) as [string, TopicCount][])
    .filter(([, c]) => c.solved + c.attempted + c.todo > 0)
    .map(([topic, counts]) => ({
      topic,
      solved: counts.solved,
      attempted: counts.attempted,
      todo: counts.todo,
      total: counts.solved + counts.attempted + counts.todo,
      color: TOPIC_COLORS[topic] || '#7c3aed',
    }))
    .sort((a, b) => b.solved - a.solved);

  // Difficulty pie data
  const diffData = [
    { name: 'Easy', value: analytics.difficultyCounts.Easy, color: '#22c55e' },
    { name: 'Medium', value: analytics.difficultyCounts.Medium, color: '#f59e0b' },
    { name: 'Hard', value: analytics.difficultyCounts.Hard, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Topic pie data (for the distribution chart)
  const topicPieData = topicData.map((t: { topic: string; solved: number; color: string }) => ({
    name: t.topic,
    value: t.solved,
    color: t.color,
  })).filter(t => t.value > 0);

  const maxTopicTotal = Math.max(...topicData.map(t => t.total), 1);

  const handleTopicClick = (topic: string) => {
    router.push(`/dsa-tracker?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-wide mb-6" style={{ color: 'var(--color-text-heading)' }}>◈ ANALYTICS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Topic Distribution — replaced radar with precise horizontal bar chart */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>
            Topic Distribution <span className="font-normal normal-case text-[10px]">(solved per topic)</span>
          </h2>
          {topicData.length > 0 ? (
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-2">
              {topicData.map((entry) => {
                const pct = Math.round((entry.solved / Math.max(entry.total, 1)) * 100);
                return (
                  <div key={entry.topic}
                    className="flex items-center gap-2.5 cursor-pointer group transition-all duration-200 hover:translate-x-0.5"
                    onClick={() => handleTopicClick(entry.topic)}>
                    <span className="w-24 text-xs font-semibold text-right shrink-0 truncate group-hover:font-bold"
                      style={{ color: 'var(--color-text-secondary)' }}>{entry.topic}</span>
                    <div className="flex-1 h-5 rounded-md overflow-hidden flex" style={{ background: 'var(--color-bg-surface)' }}>
                      {/* Solved portion */}
                      <div className="h-full transition-all duration-1000 flex items-center justify-end px-1"
                        style={{ width: `${(entry.solved / maxTopicTotal) * 100}%`, background: entry.color, minWidth: entry.solved > 0 ? '12px' : '0' }}>
                        {entry.solved > 0 && <span className="text-[10px] font-bold text-white">{entry.solved}</span>}
                      </div>
                      {/* Attempted portion */}
                      <div className="h-full transition-all duration-1000"
                        style={{ width: `${(entry.attempted / maxTopicTotal) * 100}%`, background: `${entry.color}40` }} />
                    </div>
                    <span className="w-10 text-[11px] font-bold text-right shrink-0" style={{ color: entry.color }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No problems tracked yet
            </div>
          )}
        </div>

        {/* Difficulty Doughnut + Stats */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>Difficulty Breakdown</h2>
          {diffData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={diffData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {diffData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Precise difficulty stats below chart */}
              <div className="flex justify-center gap-5 mt-3">
                {diffData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>{d.name}</span>
                    <span className="text-sm font-bold" style={{ color: d.color }}>{d.value}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      ({Math.round((d.value / analytics.totalProblems) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No solved problems yet
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fill: '#8888a8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#555577', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e8f0' }}
                formatter={(value: number) => [`${value} problems`, 'Solved']} />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Overview */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>Status Overview</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Solved', value: analytics.statusCounts.Solved, color: 'var(--color-green)', pct: analytics.totalProblems > 0 ? Math.round((analytics.statusCounts.Solved / analytics.totalProblems) * 100) : 0 },
              { label: 'Attempted', value: analytics.statusCounts.Attempted, color: 'var(--color-amber)', pct: analytics.totalProblems > 0 ? Math.round((analytics.statusCounts.Attempted / analytics.totalProblems) * 100) : 0 },
              { label: 'Todo', value: analytics.statusCounts.Todo, color: 'var(--color-text-muted)', pct: analytics.totalProblems > 0 ? Math.round((analytics.statusCounts.Todo / analytics.totalProblems) * 100) : 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3.5 rounded-lg"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold" style={{ color: 'var(--color-text-heading)' }}>{item.value}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak & Consistency */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>Streak & Consistency</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Current Streak', value: `${analytics.streak.current} days`, color: 'var(--color-red)' },
              { label: 'Longest Streak', value: `${analytics.streak.longest} days`, color: 'var(--color-purple)' },
              { label: 'Active Days', value: `${analytics.streak.totalActiveDays}`, color: 'var(--color-green)' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3.5 rounded-lg"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                </div>
                <span className="text-xl font-extrabold" style={{ color: 'var(--color-text-heading)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Topic Table */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>
            ◈ DETAILED TOPIC BREAKDOWN <span className="font-normal normal-case text-[10px]">(click to view problems)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Topic', 'Solved', 'Attempted', 'Todo', 'Total', 'Completion'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topicData.map(entry => {
                  const pct = Math.round((entry.solved / Math.max(entry.total, 1)) * 100);
                  return (
                    <tr key={entry.topic}
                      className="transition-colors duration-200 cursor-pointer"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                      onClick={() => handleTopicClick(entry.topic)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>{entry.topic}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--color-green)' }}>{entry.solved}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-amber)' }}>{entry.attempted}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{entry.todo}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{entry.total}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-surface)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: entry.color }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: entry.color }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
