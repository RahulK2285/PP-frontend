'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'bot' | 'user';
  content: string;
}

const KNOWLEDGE_BASE: Record<string, { keywords: string[]; answer: string }> = {
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'help', 'what', 'how does', 'guide', 'explain', 'start', 'use'],
    answer: `👋 **Welcome to PrepForge!** Here's what you can do:\n\n🔹 **Dashboard** — See your overall progress, activity heatmap, streaks & topic strength\n🔹 **DSA Tracker** — Track problems, sync with LeetCode automatically\n🔹 **Analytics** — Charts showing your topic distribution & difficulty breakdown\n🔹 **Resume** — Upload and manage your resumes\n🔹 **Referrals** — Request referrals and track their status\n🔹 **Recommendations** — AI-powered weak area detection with practice problems\n\nWhat would you like to know more about?`,
  },
  leetcode: {
    keywords: ['leetcode', 'sync', 'auto', 'automatic', 'import', 'solved'],
    answer: `🔄 **LeetCode Sync Feature:**\n\n1. Go to your profile (click your name in sidebar → ⚙️ Settings)\n2. Enter your LeetCode username\n3. Go to **DSA Tracker** → Click **"Sync LeetCode"**\n4. All your solved problems will be imported automatically!\n\n✅ It syncs up to **500** recent solved problems\n✅ Problems are auto-categorized by topic\n✅ Duplicate problems are skipped\n✅ Your dashboard updates in real-time`,
  },
  dashboard: {
    keywords: ['dashboard', 'home', 'overview', 'stats'],
    answer: `📊 **Dashboard Features:**\n\n• **Stats Cards** — Problems solved count, success rate, referral count (click to navigate)\n• **Quick Actions** — Jump to Add Problem, Recommendations, or Referrals\n• **Activity Heatmap** — GitHub-style heatmap of your daily coding activity\n• **Recently Solved** — Last 5 solved problems with time stamps\n• **Topic Strength Bars** — Click any topic bar to see all problems in that topic\n\n💡 All topic bars are clickable — they take you to the DSA Tracker filtered by that topic!`,
  },
  dsa: {
    keywords: ['dsa', 'tracker', 'problem', 'add', 'track', 'question'],
    answer: `📝 **DSA Tracker:**\n\n• **Add Problem** — Click "Add Problem" to manually add any question\n• **LeetCode Sync** — Auto-import all your solved problems\n• **Filter** — Filter by Topic, Difficulty, or Status\n• **Edit/Delete** — Manage your problem entries\n• **Source Badge** — Shows if a problem was added manually or via LeetCode sync\n\n🔗 Click any problem title to open it on LeetCode!\n\n💡 You can navigate here with a pre-set filter by clicking topic bars on Dashboard or Analytics.`,
  },
  analytics: {
    keywords: ['analytics', 'chart', 'graph', 'progress', 'statistics', 'distribution'],
    answer: `📈 **Analytics Page:**\n\n• **Topic Distribution** — Horizontal bars showing solved count per topic\n• **Difficulty Breakdown** — Doughnut chart with Easy/Medium/Hard split\n• **Weekly Progress** — Bar chart of problems solved per week\n• **Status Overview** — Solved vs Attempted vs Todo\n• **Streak Info** — Current streak, longest streak, total active days\n• **Detailed Table** — Click any topic row to filter the DSA Tracker\n\n💡 All topic rows are clickable and take you to DSA Tracker!`,
  },
  resume: {
    keywords: ['resume', 'upload', 'cv', 'file', 'document'],
    answer: `📄 **Resume Manager:**\n\n• **Drag & Drop** — Drag your resume file into the upload zone\n• **Supported Formats** — PDF, DOC, DOCX (max 10MB)\n• **Download** — Download any uploaded resume\n• **Delete** — Remove old resumes\n\n💡 Keep multiple versions of your resume for different types of roles!`,
  },
  referral: {
    keywords: ['referral', 'company', 'application', 'apply', 'interview'],
    answer: `🤝 **Referral System:**\n\n1. Fill the form with Company, Role, and a brief Message\n2. Submit your referral request\n3. Track status through 4 stages:\n   • Applied → Under Review → Referral Sent → Interview Set\n4. Click the step circles to update status\n\n💡 The dashboard shows your total referrals and interviews scheduled!`,
  },
  recommendations: {
    keywords: ['recommend', 'weak', 'suggest', 'practice', 'improve', 'topic'],
    answer: `🧠 **Recommendations Engine:**\n\n• Analyzes your solved problems vs targets\n• Labels each topic as **WEAK**, **MODERATE**, or **STRONG**\n• Suggests **10+ curated practice problems** per topic\n• **Click any topic card** to expand and see LeetCode links\n• Click **"View All Problems"** to go to DSA Tracker filtered by that topic\n\n💡 Focus on WEAK topics first — they have the highest return on time invested!`,
  },
  profile: {
    keywords: ['profile', 'name', 'edit', 'settings', 'username', 'account'],
    answer: `👤 **Profile Settings:**\n\n1. Click your name in the sidebar (bottom-left)\n2. Or click the ⚙️ gear icon\n3. You can edit:\n   • **Full Name** — Updates your display name everywhere\n   • **LeetCode Username** — Required for LeetCode auto-sync\n4. Click "Save Changes"`,
  },
  favicon: {
    keywords: ['icon', 'logo', 'tab', 'browser', 'red', 'circle'],
    answer: `The **◈ PrepForge** icon should appear in your browser tab. If you see a red "N" circle, that's the Next.js development mode icon — try refreshing the page or hard-reload with **Ctrl+Shift+R**!`,
  },
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase().trim();

  // Find best matching knowledge entry
  let bestMatch = '';
  let bestScore = 0;

  for (const [key, entry] of Object.entries(KNOWLEDGE_BASE)) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length; // Longer match = higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  if (bestMatch && bestScore > 0) {
    return KNOWLEDGE_BASE[bestMatch].answer;
  }

  return `I'm not sure about that! Here are things I can help with:\n\n• "How does this website work?"\n• "How to sync LeetCode?"\n• "What does the Dashboard show?"\n• "How to use DSA Tracker?"\n• "Explain Analytics"\n• "How to upload resume?"\n• "How do referrals work?"\n• "How do recommendations work?"\n• "How to edit my profile?"`;
}

export default function HelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: '👋 Hi! I\'m **PrepBot** — your guide to PrepForge. Ask me anything about how to use the platform!\n\nTry: "How does this website work?"'
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: answer }]);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick suggestion buttons
  const suggestions = [
    'How does this work?',
    'LeetCode sync',
    'Recommendations',
    'Edit profile',
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[900] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg"
        style={{
          background: isOpen ? 'var(--color-bg-card)' : 'linear-gradient(135deg, var(--color-purple), var(--color-pink))',
          border: isOpen ? '1px solid var(--color-border-light)' : 'none',
          boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(124,58,237,0.4)',
        }}
      >
        {isOpen ? <X size={22} style={{ color: 'var(--color-text-primary)' }} /> : <MessageCircle size={24} color="#fff" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[900] w-[380px] max-h-[500px] rounded-xl overflow-hidden animate-fade-in flex flex-col"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.08))', borderBottom: '1px solid var(--color-border)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-pink))' }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>PrepBot</div>
              <div className="text-[11px]" style={{ color: 'var(--color-green)' }}>● Online — Ask me anything</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-[250px] max-h-[320px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: msg.role === 'bot' ? 'linear-gradient(135deg, var(--color-purple), var(--color-pink))' : 'rgba(124,58,237,0.15)',
                  }}>
                  {msg.role === 'bot' ? <Bot size={14} color="#fff" /> : <User size={14} style={{ color: 'var(--color-purple)' }} />}
                </div>
                <div
                  className="px-3.5 py-2.5 rounded-xl text-sm leading-relaxed max-w-[270px]"
                  style={{
                    background: msg.role === 'bot' ? 'var(--color-bg-surface)' : 'rgba(124,58,237,0.15)',
                    border: `1px solid ${msg.role === 'bot' ? 'var(--color-border)' : 'rgba(124,58,237,0.2)'}`,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-line',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a78bfa">$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => { setInput(s); setTimeout(() => { setInput(''); setMessages(prev => [...prev, { role: 'user', content: s }]); setTimeout(() => setMessages(prev => [...prev, { role: 'bot', content: findAnswer(s) }]), 400); }, 50); }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all duration-200"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--color-purple-light)' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <button onClick={handleSend}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-purple-dim))' }}>
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
