'use client';

import { useState } from 'react';
import { fmtMoney } from '@/lib/util';
import { SERIES_VARS } from '@/lib/categories';

// Spending share donut. Top 7 categories keep their fixed slot color;
// the rest fold into "Other" (muted).
export default function Donut({ slices, total }) {
  const [tip, setTip] = useState(null);

  const shown = slices.slice(0, 7);
  const rest = slices.slice(7);
  const restSum = rest.reduce((s, x) => s + x.value, 0);
  const parts = [
    ...shown.map((s, i) => ({ ...s, color: SERIES_VARS[i] })),
    ...(restSum > 0 ? [{ label: 'Other', value: restSum, color: 'var(--text-muted)' }] : []),
  ];

  const R = 70;
  const STROKE = 22;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="chart-box" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Spending by category">
        <g transform="rotate(-90 90 90)">
          {parts.map((p, i) => {
            const frac = total > 0 ? p.value / total : 0;
            // 2px surface gap between segments
            const seg = Math.max(frac * C - 2, 0.5);
            const el = (
              <circle
                key={i}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth={tip?.label === p.label ? STROKE + 4 : STROKE}
                strokeDasharray={`${seg} ${C - seg}`}
                strokeDashoffset={-offset * C - 1}
                strokeLinecap="butt"
                style={{ transition: 'stroke-width .12s' }}
                onMouseEnter={(e) => setTip({ label: p.label, value: p.value, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTip(null)}
              />
            );
            offset += frac;
            return el;
          })}
        </g>
        <text x="90" y="85" textAnchor="middle" fontSize="19" fontWeight="700" fill="var(--text-primary)">
          {fmtMoney(total)}
        </text>
        <text x="90" y="104" textAnchor="middle" fontSize="11.5" fill="var(--text-muted)">
          spent
        </text>
      </svg>
      <div className="legend" style={{ flexDirection: 'column', gap: 6, marginTop: 0 }}>
        {parts.map((p, i) => (
          <span key={i} className="item">
            <span className="swatch" style={{ background: p.color }} />
            {p.label}
            <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtMoney(p.value)}
            </strong>
          </span>
        ))}
      </div>
      {tip && (
        <div className="tooltip" style={{ left: 10, top: -6 }}>
          {tip.label}: <strong>{fmtMoney(tip.value)}</strong>
          {total > 0 && <span className="muted"> · {((tip.value / total) * 100).toFixed(1)}%</span>}
        </div>
      )}
    </div>
  );
}
