'use client';

import { useMemo, useState } from 'react';
import { useBudget } from '@/components/budget-context';
import MonthPicker from '@/components/MonthPicker';
import Donut from '@/components/Donut';
import TrendChart from '@/components/TrendChart';
import { catEmoji } from '@/lib/categories';
import { currentMonthKey, fmtDate, fmtMoney, monthKey, monthLabel, shiftMonth, todayStr } from '@/lib/util';

export default function Dashboard() {
  const { data, error, addItem, removeItem } = useBudget();
  const [month, setMonth] = useState(currentMonthKey());
  const [iou, setIou] = useState({ comment: '', amount: '' });

  const calc = useMemo(() => {
    if (!data) return null;
    const inMonth = data.transactions.filter((t) => monthKey(t.date) === month);
    const spentBy = {};
    let spent = 0;
    let income = 0;
    for (const t of inMonth) {
      if (t.type === 'Income') income += t.amount;
      else {
        spent += t.amount;
        spentBy[t.category] = (spentBy[t.category] || 0) + t.amount;
      }
    }
    const budgeted = new Set(data.budgets.map((b) => b.category));
    const rows = data.budgets.map((b) => ({
      category: b.category,
      budget: b.budget,
      spent: spentBy[b.category] || 0,
    }));
    // categories with spending but no budget line still show up
    for (const [cat, amt] of Object.entries(spentBy)) {
      if (!budgeted.has(cat)) rows.push({ category: cat, budget: null, spent: amt });
    }
    const totalBudget = rows.reduce((s, r) => s + (r.budget || 0), 0);

    const slices = Object.entries(spentBy)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const key = shiftMonth(month, -i);
      let s = 0;
      let inc = 0;
      for (const t of data.transactions) {
        if (monthKey(t.date) !== key) continue;
        if (t.type === 'Income') inc += t.amount;
        else s += t.amount;
      }
      trend.push({ key, spent: s, income: inc });
    }

    const savedThisMonth = data.savings
      .filter((s) => monthKey(s.date) === month)
      .reduce((s, x) => s + x.amount, 0);

    return { rows, spent, income, totalBudget, slices, trend, savedThisMonth };
  }, [data, month]);

  if (error) return <p className="neg">⚠ {error}</p>;
  if (!data || !calc) return <p className="muted">Loading…</p>;

  const remaining = calc.totalBudget - calc.spent;
  const iouTotal = data.ious.reduce((s, x) => s + x.amount, 0);

  const addIou = async (e) => {
    e.preventDefault();
    if (!iou.comment) return;
    await addItem('ious', { comment: iou.comment, amount: Number(iou.amount) || 0, date: todayStr() });
    setIou({ comment: '', amount: '' });
  };

  return (
    <>
      {data.storage === 'ephemeral' && (
        <div className="banner">
          ⚠ No cloud database connected — changes will be lost. In Vercel, add an <strong>Upstash Redis</strong> store
          (Storage tab) to enable sync.
        </div>
      )}

      <div className="filters" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>{monthLabel(month)}</div>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <div className="grid-tiles">
        <div className="card tile">
          <div className="label">Total budget</div>
          <div className="value">{fmtMoney(calc.totalBudget)}</div>
        </div>
        <div className="card tile">
          <div className="label">Total spent</div>
          <div className="value">{fmtMoney(calc.spent)}</div>
          <div className="hint">
            {calc.totalBudget > 0 ? `${((calc.spent / calc.totalBudget) * 100).toFixed(0)}% of budget` : ' '}
          </div>
        </div>
        <div className="card tile">
          <div className="label">Remaining</div>
          <div className={`value ${remaining < 0 ? 'neg' : 'pos'}`}>{fmtMoney(remaining)}</div>
        </div>
        <div className="card tile">
          <div className="label">Income this month</div>
          <div className="value">{fmtMoney(calc.income)}</div>
          <div className="hint">Saved: {fmtMoney(calc.savedThisMonth)} / {fmtMoney(data.settings.monthlySavingsGoal)} goal</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>📊 Monthly spending by category</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th className="num">Spent</th>
                <th className="num">Budget</th>
                <th className="num">Remaining</th>
                <th style={{ width: '22%' }}>% used</th>
              </tr>
            </thead>
            <tbody>
              {calc.rows.map((r) => {
                const pct = r.budget > 0 ? r.spent / r.budget : null;
                const over = r.budget != null && r.spent > r.budget;
                return (
                  <tr key={r.category}>
                    <td>
                      {catEmoji(r.category)} {r.category}
                    </td>
                    <td className="num">{fmtMoney(r.spent)}</td>
                    <td className="num">{r.budget != null ? fmtMoney(r.budget) : <span className="muted">—</span>}</td>
                    <td className={`num ${over ? 'neg' : ''}`}>
                      {r.budget != null ? fmtMoney(r.budget - r.spent) : <span className="muted">—</span>}
                    </td>
                    <td>
                      {pct != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="bar-track" style={{ flex: 1 }}>
                            <div className={`bar-fill ${over ? 'over' : ''}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                          </div>
                          <span className={`small ${over ? 'neg' : 'muted'}`} style={{ minWidth: 38, textAlign: 'right' }}>
                            {(pct * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="muted small">no budget</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700 }}>
                <td>TOTAL</td>
                <td className="num">{fmtMoney(calc.spent)}</td>
                <td className="num">{fmtMoney(calc.totalBudget)}</td>
                <td className={`num ${remaining < 0 ? 'neg' : ''}`}>{fmtMoney(remaining)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h2>🍩 Where the money went</h2>
          {calc.slices.length ? (
            <Donut slices={calc.slices} total={calc.spent} />
          ) : (
            <p className="muted">No spending recorded for {monthLabel(month)}.</p>
          )}
        </div>
        <div className="card">
          <h2>📈 Last 6 months</h2>
          <TrendChart months={calc.trend} />
        </div>
      </div>

      <div className="card">
        <h2>
          📝 IOUs &amp; comments{' '}
          {iouTotal > 0 && <span className="muted" style={{ fontWeight: 500 }}>· total {fmtMoney(iouTotal)}</span>}
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Comment</th>
                <th className="num">Amount</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.ious.map((x) => (
                <tr key={x.id}>
                  <td>{x.comment}</td>
                  <td className="num">{fmtMoney(x.amount)}</td>
                  <td className="muted small">{fmtDate(x.date)}</td>
                  <td className="num">
                    <button className="btn danger-ghost" title="Delete" onClick={() => removeItem('ious', x.id)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {!data.ious.length && (
                <tr>
                  <td colSpan={4} className="muted">Nothing here — nobody owes you money 🎉</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <form className="form-row" style={{ marginTop: 12 }} onSubmit={addIou}>
          <div className="field" style={{ flex: '3 1 200px' }}>
            <label>Comment</label>
            <input
              value={iou.comment}
              onChange={(e) => setIou({ ...iou, comment: e.target.value })}
              placeholder="e.g. Trin owes for services"
            />
          </div>
          <div className="field" style={{ flex: '1 1 100px' }}>
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={iou.amount}
              onChange={(e) => setIou({ ...iou, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <button className="btn primary" type="submit">Add</button>
        </form>
      </div>
    </>
  );
}
