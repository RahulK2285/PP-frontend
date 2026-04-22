'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchResumes, uploadResume, deleteResume, rescoreResume } from '@/store/resumeSlice';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Upload, FileText, Trash2, Download, Eye, X, RefreshCw, Award, TrendingUp, Lightbulb, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { Resume, ResumeScore, ResumeScoreCategory } from '@/types';

// Score circular gauge component
function ScoreGauge({ percentage, grade, size = 120 }: { percentage: number; grade: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let color = '#ef4444'; // red
  if (percentage >= 75) color = '#22c55e'; // green
  else if (percentage >= 55) color = '#f59e0b'; // amber
  else if (percentage >= 35) color = '#f97316'; // orange

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="8"
          stroke="rgba(255,255,255,0.06)" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="8"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold" style={{ color }}>{percentage}</span>
        <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>GRADE {grade}</span>
      </div>
    </div>
  );
}

// Score category row
function CategoryRow({ cat }: { cat: ResumeScoreCategory }) {
  const pct = Math.round((cat.score / cat.maxScore) * 100);
  const color = cat.status === 'good' ? '#22c55e' : cat.status === 'warning' ? '#f59e0b' : '#ef4444';
  const Icon = cat.status === 'good' ? CheckCircle : cat.status === 'warning' ? AlertTriangle : XCircle;

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors"
      style={{ background: 'var(--color-bg-surface)' }}>
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cat.name}</span>
          <span className="text-xs font-bold" style={{ color }}>{cat.score}/{cat.maxScore}</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{cat.feedback}</p>
      </div>
    </div>
  );
}

// Score panel for a single resume
function ScorePanel({ score, resumeId, scoring, onRescore }: {
  score: ResumeScore | null | undefined;
  resumeId: string;
  scoring: boolean;
  onRescore: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!score || score.percentage === 0) {
    return (
      <div className="mt-3 rounded-lg p-4" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award size={18} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {score?.percentage === 0 ? 'Upload PDF for scoring analysis' : 'Score not available'}
            </span>
          </div>
          <button onClick={onRescore} disabled={scoring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--color-purple-light)' }}>
            <RefreshCw size={12} className={scoring ? 'animate-spin' : ''} />
            {scoring ? 'Scoring...' : 'Analyze'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl overflow-hidden animate-fade-in"
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
      {/* Summary Row */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors"
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-card-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
        <ScoreGauge percentage={score.percentage} grade={score.grade} size={60} />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>
              Resume Score: {score.percentage}%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: score.percentage >= 75 ? 'rgba(34,197,94,0.15)' : score.percentage >= 55 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: score.percentage >= 75 ? '#4ade80' : score.percentage >= 55 ? '#fbbf24' : '#f87171',
              }}>
              {score.grade}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {score.totalScore} / {score.maxScore} points
            {' · '}
            {score.categories.filter(c => c.status === 'good').length} strong,
            {' '}
            {score.categories.filter(c => c.status === 'bad').length} need work
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRescore(); }} disabled={scoring}
            className="w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: 'var(--color-text-secondary)' }} title="Re-score">
            <RefreshCw size={14} className={scoring ? 'animate-spin' : ''} />
          </button>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* Category Breakdown */}
          <h4 className="text-[11px] font-bold tracking-wider uppercase mt-3 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <TrendingUp size={12} className="inline mr-1.5" /> Category Breakdown
          </h4>
          <div className="flex flex-col gap-1.5">
            {score.categories.map((cat, i) => (
              <CategoryRow key={i} cat={cat} />
            ))}
          </div>

          {/* Tips */}
          {score.tips.length > 0 && (
            <>
              <h4 className="text-[11px] font-bold tracking-wider uppercase mt-4 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <Lightbulb size={12} className="inline mr-1.5" /> Improvement Tips
              </h4>
              <div className="flex flex-col gap-1.5">
                {score.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', color: 'var(--color-text-primary)' }}>
                    <span style={{ color: '#fbbf24' }}>💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { resumes, uploading, loading, scoring } = useSelector((state: RootState) => state.resume);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchResumes()); }, [dispatch]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      dispatch(uploadResume(acceptedFiles[0]));
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Build a preview URL that includes auth token for the iframe
  const getPreviewUrl = (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('prepforge_token') : null;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}/api/resumes/${id}/preview?token=${token}`;
  };

  const handleDownload = async (r: Resume) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('prepforge_token') : null;
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${base}/api/resumes/${r._id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const previewResume = resumes.find(r => r._id === previewId);
  const getMimeIcon = (mime: string) => {
    if (mime === 'application/pdf') return '📄';
    return '📝';
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-wide mb-6" style={{ color: 'var(--color-text-heading)' }}>◈ RESUME MANAGER</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upload Zone */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div
            {...getRootProps()}
            className="rounded-xl p-12 text-center cursor-pointer transition-all duration-300"
            style={{
              border: `2px dashed ${isDragActive ? 'var(--color-purple)' : 'var(--color-border-light)'}`,
              background: isDragActive ? 'rgba(124,58,237,0.05)' : 'transparent',
            }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-purple)' }} />
                </div>
                <p className="text-base font-semibold" style={{ color: 'var(--color-purple)' }}>Uploading & Analyzing...</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Scoring your resume, please wait</p>
              </>
            ) : (
              <>
                <Upload size={48} className="mx-auto mb-4 opacity-40" style={{ color: 'var(--color-text-secondary)' }} />
                <p className="text-base font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>or click to browse (PDF, DOC, DOCX · Max 10MB)</p>
                <p className="text-xs mt-3 px-4 py-1.5 rounded-full inline-block" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--color-purple-light)' }}>
                  📊 Auto-scoring enabled — get instant feedback on your resume
                </p>
              </>
            )}
          </div>
        </div>

        {/* Resume List */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-xs font-bold tracking-wider mb-5 uppercase" style={{ color: 'var(--color-text-secondary)' }}>Uploaded Resumes</h2>
          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No resumes uploaded yet.</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Upload a PDF to get your resume scored</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {resumes.map((r) => (
                <div key={r._id} className="flex items-center justify-between px-4 py-3.5 rounded-lg transition-colors duration-200"
                  style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center relative" style={{ background: 'rgba(124,58,237,0.1)' }}>
                      <FileText size={20} style={{ color: 'var(--color-purple)' }} />
                      {r.score && r.score.percentage > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{
                            background: r.score.percentage >= 75 ? '#22c55e' : r.score.percentage >= 55 ? '#f59e0b' : '#ef4444',
                          }}>
                          {r.score.grade}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.originalName}</div>
                      <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{getMimeIcon(r.mimeType)} {formatFileSize(r.fileSize)}</span>
                        <span>·</span>
                        <span>{formatDate(r.createdAt)}</span>
                        {r.score && r.score.percentage > 0 && (
                          <>
                            <span>·</span>
                            <span style={{
                              color: r.score.percentage >= 75 ? '#4ade80' : r.score.percentage >= 55 ? '#fbbf24' : '#f87171',
                              fontWeight: 600,
                            }}>
                              Score: {r.score.percentage}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {r.mimeType === 'application/pdf' && (
                      <button onClick={() => setPreviewId(previewId === r._id ? null : r._id)}
                        className="w-8 h-8 rounded flex items-center justify-center transition-colors cursor-pointer"
                        style={{ color: previewId === r._id ? 'var(--color-purple)' : 'var(--color-text-secondary)' }} title="Preview">
                        <Eye size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDownload(r)}
                      className="w-8 h-8 rounded flex items-center justify-center transition-colors cursor-pointer"
                      style={{ color: 'var(--color-text-secondary)' }} title="Download">
                      <Download size={14} />
                    </button>
                    <button onClick={() => dispatch(deleteResume(r._id))}
                      className="w-8 h-8 rounded flex items-center justify-center transition-colors cursor-pointer"
                      style={{ color: 'var(--color-red)' }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score Panels - Below for each resume */}
      {resumes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold tracking-wider mb-4 uppercase flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <Award size={14} /> Resume Scores & Analysis
          </h2>
          <div className="flex flex-col gap-4">
            {resumes.map((r) => (
              <div key={r._id} className="rounded-xl p-5" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2.5 mb-1">
                  <FileText size={16} style={{ color: 'var(--color-purple)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>{r.originalName}</span>
                </div>
                <ScorePanel
                  score={r.score}
                  resumeId={r._id}
                  scoring={scoring === r._id}
                  onRescore={() => dispatch(rescoreResume(r._id))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewId && previewResume && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPreviewId(null)}>
          <div className="w-full max-w-4xl h-[85vh] rounded-xl overflow-hidden flex flex-col animate-fade-in"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <FileText size={18} style={{ color: 'var(--color-purple)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>{previewResume.originalName}</span>
                {previewResume.score && previewResume.score.percentage > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: previewResume.score.percentage >= 75 ? 'rgba(34,197,94,0.15)' : previewResume.score.percentage >= 55 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: previewResume.score.percentage >= 75 ? '#4ade80' : previewResume.score.percentage >= 55 ? '#fbbf24' : '#f87171',
                    }}>
                    Score: {previewResume.score.percentage}% ({previewResume.score.grade})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(previewResume)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--color-purple-light)' }}>
                  <Download size={12} /> Download
                </button>
                <button onClick={() => setPreviewId(null)}
                  className="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PDF Embed */}
            <div className="flex-1 bg-gray-900">
              <iframe
                src={getPreviewUrl(previewId)}
                className="w-full h-full"
                style={{ border: 'none' }}
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
