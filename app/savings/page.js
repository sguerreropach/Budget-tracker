'use client';

import { useState } from 'react';
import { useBudget } from '@/components/budget-context';
import { fmtDate, fmtMoney, todayStr } from '@/lib/util';

export default function SavingsPage() {
  const { data, error, addItem, removeItem } = useBudget();
  const [form, setForm] = useState({ date: todayStr(), amount: '' });
  const [saving, setSaving] = useState(false);

  if (error) return <p className="neg">⚠ {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  const log = [...data.savings].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  let running = 0;
  const rows = log.map((s) => ({ ...s, running: (running += s.amount) }));
  const total = running;
  const goal = data.settings.savingsGoal || 0;
  const monthly = data.settings.monthlySavingsGoal || 0;
  const remaining = Math.max(0, goal - total);
  const monthsToGoal = monthly > 0 ? Math.ceil(remaining / monthly) : null;
  const pct = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) return;
    setSaving(true);
    try {
      await addItem('savings', { date: form.date, amount: Number(form.amount) });
      setForm({ date: todayStr(), amount: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-title">💎 Savings</div>
      <div className="page-sub">Goals are editable in Settings.</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="savings-hero">
          <div className="big">{fmtMoney(total)}</div>
          <div className="sub">saved of your {fmtMoney(goal)} goal</div>
        </div>
        <div className="progress-lg">
          <div className="fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="filters" style={{ justifyContent: 'space-between', marginBottom: 0 }}>
          <span className="small muted">{pct.toFixed(0)}% there</span>
          <span className="small muted">
            {fmtMoney(remaining)} to go
            {monthsToGoal != null && remaining > 0 && ` · ~${monthsToGoal} months at ${fmtMoney(monthly)}/mo`}
            {remaining === 0 && ' · goal reached 🎉'}
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>➕ Log a deposit</h2>
        <form className="form-row" onSubmit={submit}>
          <div className="field" style={{ flex: '1 1 140px' }}>
            <label>Date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field" style={{ flex: '1 1 120px' }}>
            <label>Amount saved ($)</label>
            <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </div>
          <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
        </form>
      </div>

      <div className="card">
        <h2>📈 Savings log</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">Amount saved</th>
                <th className="num">Running total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((s) => (
                <tr key={s.id}>
                  <td className="small">{fmtDate(s.date)}</td>
                  <td className="num pos">{fmtMoney(s.amount, { sign: true })}</td>
                  <td className="num">{fmtMoney(s.running)}</td>
                  <td className="num">
                    <button className="btn danger-ghost" title="Delete" onClick={() => removeItem('savings', s.id)}>✕</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="muted">No deposits logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
