'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import type { Recommendation } from '@/types';
import { ArrowRight, ExternalLink, ChevronDown, ChevronUp, Filter } from 'lucide-react';

import { Suspense } from 'react';

// Auto-generate LeetCode URL from problem title
function toLeetCodeUrl(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://leetcode.com/problems/${slug}/`;
}

function RecommendationsContent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Recommendation | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterTopic = searchParams.get('topic') || '';

  useEffect(() => {
    api.get('/recommendations')
      .then(res => { setRecommendations(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // If a topic filter is in URL, auto-expand that topic
  useEffect(() => {
    if (filterTopic && recommendations.length > 0) {
      handleCardClick(filterTopic);
    }
  }, [filterTopic, recommendations.length]);

  if (loading) {
    return <div className="text-center py-20 text-sm" style={{ color: 'var(--color-text-muted)' }}>Analyzing your progress...</div>;
  }

  const levelConfig = {
    weak: { color: 'var(--color-red)', bg: 'rgba(239,68,68,0.15)', label: 'WEAK', gradient: 'linear-gradient(90deg, var(--color-red), var(--color-amber))' },
    moderate: { color: 'var(--color-amber)', bg: 'rgba(245,158,11,0.15)', label: 'MODERATE', gradient: 'linear-gradient(90deg, var(--color-amber), var(--color-green))' },
    strong: { color: 'var(--color-green)', bg: 'rgba(34,197,94,0.15)', label: 'STRONG', gradient: 'linear-gradient(90deg, var(--color-green), var(--color-cyan))' },
  };

  const handleCardClick = async (topic: string) => {
    if (expandedTopic === topic) {
      setExpandedTopic(null);
      setExpandedData(null);
      return;
    }

    setExpandedTopic(topic);

    // Fetch expanded recommendations with ?topic= filter to get 10 suggestions
    try {
      const res = await api.get(`/recommendations?topic=${encodeURIComponent(topic)}`);
      if (res.data.length > 0) {
        setExpandedData(res.data[0]);
      }
    } catch {
      // Fallback to existing data
      const existing = recommendations.find(r => r.topic === topic);
      if (existing) setExpandedData(existing);
    }
  };

  const handleViewAllProblems = (topic: string) => {
    router.push(`/dsa-tracker?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-wide mb-1" style={{ color: 'var(--color-text-heading)' }}>◈ RECOMMENDATIONS</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Personalized suggestions based on your weak areas. <span style={{ color: 'var(--color-text-muted)' }}>Click a topic card to see 10+ practice problems.</span>
      </p>

      {recommendations.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Solve at least 5 problems to get personalized recommendations!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((rec) => {
            const config = levelConfig[rec.level];
            const isExpanded = expandedTopic === rec.topic;
            const displayRec = isExpanded && expandedData ? expandedData : rec;

            return (
              <div key={rec.topic}
                className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${isExpanded ? 'md:col-span-2 lg:col-span-3 shadow-lg' : 'hover:-translate-y-0.5 hover:shadow-lg'}`}
                style={{
                  background: 'var(--color-bg-card)',
                  border: isExpanded ? `1px solid ${config.color}` : '1px solid var(--color-border)',
                }}
                onClick={() => handleCardClick(rec.topic)}
              >
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: config.gradient }} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold" style={{ color: 'var(--color-text-heading)' }}>{rec.topic}</span>
                      {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: config.bg, color: config.color }}>
                      {config.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm mb-3.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>{rec.solved}/{rec.target} solved</span>
                    <span>{rec.percentage}%</span>
                    {isExpanded && <span style={{ color: 'var(--color-text-muted)' }}>· {displayRec.suggestions.length} problems to practice</span>}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-4" style={{ background: 'var(--color-bg-surface)' }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rec.percentage}%`, background: config.color }} />
                  </div>

                  {/* Suggestions */}
                  <div className={`flex flex-col gap-2 ${isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : ''}`}>
                    {(isExpanded ? displayRec.suggestions : rec.suggestions.slice(0, 3)).map((s, i) => {
                      const url = toLeetCodeUrl(s);
                      return (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 group/item"
                          style={{ background: isExpanded ? 'var(--color-bg-surface)' : 'transparent', border: isExpanded ? '1px solid var(--color-border)' : 'none' }}
                          onMouseEnter={(e) => { if (isExpanded) e.currentTarget.style.borderColor = 'var(--color-purple)'; }}
                          onMouseLeave={(e) => { if (isExpanded) e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--color-purple-light)' }}>{i + 1}</span>
                            {s}
                          </div>
                          {isExpanded && (
                            <a href={url} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-all duration-200 opacity-60 hover:opacity-100 shrink-0"
                              style={{ color: 'var(--color-purple)', background: 'rgba(124,58,237,0.1)' }}>
                              <ExternalLink size={12} />
                              Solve on LeetCode
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded footer */}
                  {isExpanded && (
                    <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {rec.target - rec.solved > 0
                          ? `You need ${rec.target - rec.solved} more problems to be strong in ${rec.topic}`
                          : `Great job! You're strong in ${rec.topic}!`}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewAllProblems(rec.topic); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))', color: '#fff' }}>
                        <Filter size={12} /> View All {rec.topic} Problems <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Collapsed hint */}
                  {!isExpanded && rec.suggestions.length > 3 && (
                    <div className="flex items-center gap-1 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      <ChevronDown size={11} /> Click to see {rec.suggestions.length - 3}+ more problems
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
