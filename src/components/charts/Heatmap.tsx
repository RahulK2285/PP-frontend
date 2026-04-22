'use client';

import { useMemo } from 'react';

interface HeatmapProps {
  data: Record<string, number>;
}

export default function Heatmap({ data }: HeatmapProps) {
  const cells = useMemo(() => {
    const result: { date: string; level: number; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const count = data[key] || 0;
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      result.push({ date: key, level, count });
    }
    return result;
  }, [data]);

  const levelColors = [
    'var(--color-hm-0)',
    'var(--color-hm-1)',
    'var(--color-hm-2)',
    'var(--color-hm-3)',
    'var(--color-hm-4)',
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateRows: 'repeat(7, 1fr)',
            gridAutoFlow: 'column',
            padding: '4px 0',
          }}
        >
          {cells.map((cell) => (
            <div
              key={cell.date}
              className="w-[14px] h-[14px] rounded-[3px] transition-all duration-200 hover:scale-[1.4] hover:outline-2"
              style={{
                background: levelColors[cell.level],
                outlineColor: 'var(--color-purple)',
              }}
              title={`${cell.date}: ${cell.count} problem${cell.count !== 1 ? 's' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[11px] mx-1" style={{ color: 'var(--color-text-muted)' }}>Less</span>
        {levelColors.map((color, i) => (
          <span key={i} className="w-[14px] h-[14px] rounded-[3px]" style={{ background: color }} />
        ))}
        <span className="text-[11px] mx-1" style={{ color: 'var(--color-text-muted)' }}>More</span>
      </div>
    </div>
  );
}
