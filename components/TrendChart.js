'use client';

import { useState } from 'react';
import { fmtMoney, monthLabel } from '@/lib/util';

// Grouped bars: spending (slot 1) vs income (slot 2) for the last 6 months.
export default function TrendChart({ months }) {
  const [tip, setTip] = useState(null);

  const W = 560;
  const H = 200;
  const PAD = { top: 12, right: 8, bottom: 24, left: 46 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...months.flatMap((m) => [m.spent, m.income]));
  const niceMax = Math.ceil(max / 500) * 500;
  const y = (v) => PAD.top + ih - (v / niceMax) * ih;

  const groupW = iw / months.length;
  const barW = Math.min(22, (groupW - 14) / 2);
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <div className="chart-box">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Income vs spending by month"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" fontSize="10.5" fill="var(--text-muted)">
              {t >= 1000 ? `$${t / 1000}k` : `$${t}`}
            </text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = PAD.left + groupW * i + groupW / 2;
          const bars = [
            { key: 'spent', label: 'Spending', v: m.spent, color: 'var(--series-1)', x: cx - barW - 1 },
            { key: 'income', label: 'Income', v: m.income, color: 'var(--series-2)', x: cx + 1 },
          ];
          return (
            <g key={m.key}>
              {bars.map((b) => (
                <rect
                  key={b.key}
                  x={b.x}
                  y={y(b.v)}
                  width={barW}
                  height={Math.max(0, PAD.top + ih - y(b.v))}
                  fill={b.color}
                  rx="3"
                  opacity={tip && tip.key !== m.key ? 0.45 : 1}
                  onMouseEnter={() => setTip({ key: m.key, label: monthLabel(m.key), spent: m.spent, income: m.income, cx })}
                  onMouseLeave={() => setTip(null)}
                />
              ))}
              <text x={cx} y={H - 7} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)">
                {monthLabel(m.key).slice(0, 3)}
              </text>
            </g>
          );
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + ih} y2={PAD.top + ih} stroke="var(--baseline)" strokeWidth="1" />
      </svg>
      <div className="legend">
        <span className="item">
          <span className="swatch" style={{ background: 'var(--series-1)' }} /> Spending
        </span>
        <span className="item">
          <span className="swatch" style={{ background: 'var(--series-2)' }} /> Income
        </span>
      </div>
      {tip && (
        <div className="tooltip" style={{ left: `${(tip.cx / W) * 100}%`, top: 0, transform: 'translateX(-50%)' }}>
          <strong>{tip.label}</strong>
          <br />
          Spending: <strong>{fmtMoney(tip.spent)}</strong>
          <br />
          Income: <strong>{fmtMoney(tip.income)}</strong>
        </div>
      )}
    </div>
  );
}
