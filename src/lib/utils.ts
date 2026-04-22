export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Topic bar colors mapping
export const TOPIC_COLORS: Record<string, string> = {
  'Arrays': '#22c55e',
  'Strings': '#a78bfa',
  'Linked List': '#06b6d4',
  'Trees': '#f59e0b',
  'Graphs': '#ec4899',
  'DP': '#ef4444',
  'Binary Search': '#3b82f6',
  'Backtracking': '#22d3ee',
  'Stack': '#f472b6',
  'Queue': '#4ade80',
  'Heap': '#fbbf24',
  'Greedy': '#a78bfa',
  'Two Pointers': '#22c55e',
  'Sliding Window': '#06b6d4',
  'Trie': '#f59e0b',
  'Hash Table': '#7c3aed',
  'Bit Manipulation': '#ec4899',
  'Math': '#3b82f6',
  'Sorting': '#ef4444',
  'Other': '#8888a8',
};
