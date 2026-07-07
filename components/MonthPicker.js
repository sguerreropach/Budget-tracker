'use client';

import { monthLabel, shiftMonth } from '@/lib/util';

export default function MonthPicker({ value, onChange }) {
  return (
    <div className="month-picker">
      <button aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        ◀
      </button>
      <span className="label">{monthLabel(value)}</span>
      <button aria-label="Next month" onClick={() => onChange(shiftMonth(value, 1))}>
        ▶
      </button>
    </div>
  );
}
