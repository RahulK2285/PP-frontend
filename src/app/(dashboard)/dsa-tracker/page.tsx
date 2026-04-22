'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchProblems, createProblem, updateProblem, deleteProblem, syncLeetCode, clearSyncResult } from '@/store/dsaSlice';
import { TOPICS, type Difficulty, type ProblemStatus, type Topic } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Plus, RefreshCw, Pencil, Trash2, ExternalLink, Check } from 'lucide-react';

export default function DSATrackerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const { problems, syncing, syncResult, loading } = useSelector((state: RootState) => state.dsa);
  const { user } = useSelector((state: RootState) => state.auth);

  // Initialize filter from URL query param (e.g. ?topic=Trees)
  const initialTopic = searchParams.get('topic') || '';

  // Filters
  const [filterTopic, setFilterTopic] = useState(initialTopic);
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', topic: 'Arrays' as Topic, difficulty: 'Medium' as Difficulty, status: 'Todo' as ProblemStatus, url: '', notes: '' });

  useEffect(() => {
    dispatch(fetchProblems({ topic: filterTopic, difficulty: filterDifficulty, status: filterStatus }));
  }, [dispatch, filterTopic, filterDifficulty, filterStatus]);

  const handleSync = () => {
    dispatch(syncLeetCode()).then(() => {
      dispatch(fetchProblems({ topic: filterTopic, difficulty: filterDifficulty, status: filterStatus }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await dispatch(updateProblem({ id: editingId, data: form }));
    } else {
      await dispatch(createProblem(form));
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ title: '', topic: 'Arrays', difficulty: 'Medium', status: 'Todo', url: '', notes: '' });
  };

  const handleEdit = (p: typeof problems[0]) => {
    setEditingId(p._id);
    setForm({ title: p.title, topic: p.topic, difficulty: p.difficulty, status: p.status, url: p.url || '', notes: p.notes || '' });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this problem?')) dispatch(deleteProblem(id));
  };

  const selectStyle = {
    background: 'var(--color-bg-input)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  const difficultyColor = (d: string) => {
    if (d === 'Easy') return { bg: 'rgba(34,197,94,0.15)', color: 'var(--color-green)' };
    if (d === 'Medium') return { bg: 'rgba(245,158,11,0.15)', color: 'var(--color-amber)' };
    return { bg: 'rgba(239,68,68,0.15)', color: 'var(--color-red)' };
  };

  const statusColor = (s: string) => {
    if (s === 'Solved') return 'var(--color-green)';
    if (s === 'Attempted') return 'var(--color-amber)';
    return 'var(--color-text-muted)';
  };

  // Recently solved from sync results
  const recentlySolved = syncResult?.submissions || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--color-text-heading)' }}>
          ◈ PROBLEM LOG {filterTopic && <span className="text-sm font-normal" style={{ color: 'var(--color-purple-light)' }}> — {filterTopic}</span>}
        </h1>
        <div className="flex gap-2.5">
          <button onClick={handleSync} disabled={syncing || !user?.leetcodeUsername}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{ background: 'transparent', border: '1px solid var(--color-border-light)', color: 'var(--color-text-primary)' }}
            title={!user?.leetcodeUsername ? 'Set your LeetCode username in your profile first' : 'Sync from LeetCode'}>
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync LeetCode'}</span>
          </button>
          <button onClick={() => { setEditingId(null); setForm({ title: '', topic: 'Arrays', difficulty: 'Medium', status: 'Todo', url: '', notes: '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))', boxShadow: '0 2px 10px rgba(124,58,237,0.25)' }}>
            <Plus size={16} />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Sync status bar */}
      {syncing && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-4 animate-pulse"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,197,94,0.05))', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <RefreshCw size={16} className="animate-spin" />
            <span>Syncing with LeetCode...</span>
          </div>
        </div>
      )}

      {syncResult && !syncing && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="text-sm" style={{ color: 'var(--color-green)' }}>
            ✅ Synced {syncResult.synced} new problem{syncResult.synced !== 1 ? 's' : ''} · {syncResult.skipped} already tracked
          </span>
          <button onClick={() => dispatch(clearSyncResult())} className="text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}
          className="min-w-[140px] text-sm py-2.5 px-3 rounded-lg outline-none cursor-pointer" style={selectStyle}>
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}
          className="min-w-[140px] text-sm py-2.5 px-3 rounded-lg outline-none cursor-pointer" style={selectStyle}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="min-w-[140px] text-sm py-2.5 px-3 rounded-lg outline-none cursor-pointer" style={selectStyle}>
          <option value="">All Status</option>
          <option value="Solved">Solved</option>
          <option value="Attempted">Attempted</option>
          <option value="Todo">Todo</option>
        </select>
      </div>

      {/* Problems Table */}
      <div className="rounded-xl overflow-hidden mb-5" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm mt-3">No problems yet. Add your first problem or sync with LeetCode!</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--color-bg-surface)' }}>
              <tr>
                {['TITLE', 'TOPIC', 'DIFFICULTY', 'STATUS', 'SOURCE', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => {
                const dc = difficultyColor(p.difficulty);
                return (
                  <tr key={p._id} className="transition-colors duration-200" style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>
                        {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-text-heading)' }}>{p.title}</a> : p.title}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{p.topic}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: dc.bg, color: dc.color }}>{p.difficulty}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold" style={{ color: statusColor(p.status) }}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold"
                        style={{
                          background: p.source === 'leetcode' ? 'rgba(245,158,11,0.1)' : 'rgba(124,58,237,0.1)',
                          color: p.source === 'leetcode' ? 'var(--color-amber)' : 'var(--color-purple-light)',
                        }}>
                        {p.source === 'leetcode' ? 'LeetCode' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors"
                          style={{ color: 'var(--color-red)' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }} title="Open on LeetCode">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Recently Solved on LeetCode */}
      {recentlySolved.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-4 uppercase flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <Check size={18} style={{ stroke: 'var(--color-green)' }} />
            Recently Solved on LeetCode
          </h2>
          <div className="flex flex-col gap-2">
            {recentlySolved.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-green)'; e.currentTarget.style.background = 'rgba(34,197,94,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-surface)'; }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-green)' }}>
                    <Check size={12} color="#fff" />
                  </div>
                  <a href={`https://leetcode.com/problems/${sub.titleSlug}/`} target="_blank" rel="noopener noreferrer"
                    className="font-semibold text-sm hover:underline" style={{ color: 'var(--color-text-heading)' }}>
                    {sub.title}
                  </a>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatRelativeTime(new Date(parseInt(sub.timestamp) * 1000).toISOString())}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}>
          <div className="rounded-xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto animate-fade-in"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>{editingId ? 'Edit Problem' : 'Add Problem'}</h2>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded flex items-center justify-center cursor-pointer"
                style={{ color: 'var(--color-text-secondary)' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                  className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Topic</label>
                  <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as Topic })}
                    className="w-full px-3 py-3 rounded-lg text-sm outline-none cursor-pointer" style={selectStyle}>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                    className="w-full px-3 py-3 rounded-lg text-sm outline-none cursor-pointer" style={selectStyle}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProblemStatus })}
                  className="w-full px-3 py-3 rounded-lg text-sm outline-none cursor-pointer" style={selectStyle}>
                  <option value="Todo">Todo</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Solved">Solved</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>URL (optional)</label>
                <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3.5 py-3 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <button type="submit" className="w-full py-3 rounded-lg text-sm font-semibold text-white cursor-pointer mt-2"
                style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))' }}>
                {editingId ? 'Update Problem' : 'Add Problem'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
