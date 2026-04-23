'use client';

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import type { Recommendation } from '@/types';
import { ArrowRight, ExternalLink, ChevronDown, ChevronUp, Filter } from 'lucide-react';

// Auto-generate LeetCode URL
function toLeetCodeUrl(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://leetcode.com/problems/${slug}/`;
}

// 🔥 Move your whole logic into inner component
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

  useEffect(() => {
    if (filterTopic && recommendations.length > 0) {
      handleCardClick(filterTopic);
    }
  }, [filterTopic, recommendations.length]);

  const handleCardClick = async (topic: string) => {
    if (expandedTopic === topic) {
      setExpandedTopic(null);
      setExpandedData(null);
      return;
    }

    setExpandedTopic(topic);

    try {
      const res = await api.get(`/recommendations?topic=${encodeURIComponent(topic)}`);
      if (res.data.length > 0) {
        setExpandedData(res.data[0]);
      }
    } catch {
      const existing = recommendations.find(r => r.topic === topic);
      if (existing) setExpandedData(existing);
    }
  };

  const handleViewAllProblems = (topic: string) => {
    router.push(`/dsa-tracker?topic=${encodeURIComponent(topic)}`);
  };

  if (loading) {
    return <div className="text-center py-20 text-sm">Analyzing your progress...</div>;
  }

  return (
    <div>
      {recommendations.map((rec) => (
        <div key={rec.topic} onClick={() => handleCardClick(rec.topic)}>
          {rec.topic}
        </div>
      ))}
    </div>
  );
}

// 🔥 Wrap with Suspense (MAIN FIX)
export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
