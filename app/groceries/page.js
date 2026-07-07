'use client';

import { useMemo, useState } from 'react';
import { useBudget } from '@/components/budget-context';
import MonthPicker from '@/components/MonthPicker';
import { currentMonthKey, fmtDate, fmtMoney, monthKey, monthLabel, todayStr } from '@/lib/util';

const STORES = ['Walmart', 'Publix', 'Aldi', 'Dollar General'];

export default function GroceriesPage() {
  const { data, error, addItem, removeItem } = useBudget();
  const [month, setMonth] = useState(currentMonthKey());
  const [form, setForm] = useState({ date: todayStr(), item: '', store: 'Walmart', amount: '' });
  const [saving, setSaving] = useState(false);

  const stores = useMemo(() => {
    const set = new Set(STORES);
    for (const g of data?.groceries || []) if (g.store) set.add(g.store);
    return [...set];
  }, [data]);

  const inMonth = useMemo(
    () =>
      (data?.groceries || [])
        .filter((g) => monthKey(g.date) === month)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data, month]
  );

  if (error) return <p className="neg">⚠ {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  const total = inMonth.reduce((s, g) => s + g.amount, 0);
  const byStore = {};
  for (const g of inMonth) byStore[g.store || 'Other'] = (byStore[g.store || 'Other'] || 0) + g.amount;
  const storeRows = Object.entries(byStore).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...storeRows.map(([, v]) => v));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.item || !form.date) return;
    setSaving(true);
    try {
      await addItem('groceries', { date: form.date, item: form.item, store: form.store, amount: Number(form.amount) || 0 });
      setForm({ ...form, item: '', amount: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="filters" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">🛒 Groceries</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>{monthLabel(month)}</div>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card tile">
          <div className="label">Total groceries · {monthLabel(month)}</div>
          <div className="value">{fmtMoney(total)}</div>
          <div className="hint">{inMonth.length} trips</div>
        </div>
        <div className="card">
          <h2>By store</h2>
          {storeRows.length ? (
            storeRows.map(([store, v]) => (
              <div key={store} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="small" style={{ minWidth: 110 }}>{store}</span>
                <div className="bar-track" style={{ flex: 1 }}>
                  <div className="bar-fill" style={{ width: `${(v / max) * 100}%`, background: 'var(--series-2)' }} />
                </div>
                <span className="small" style={{ minWidth: 70, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtMoney(v)}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No grocery runs logged this month.</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>➕ Add grocery run</h2>
        <form className="form-row" onSubmit={submit}>
          <div className="field" style={{ flex: '1 1 130px' }}>
            <label>Date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field" style={{ flex: '2 1 200px' }}>
            <label>Items / description</label>
            <input required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. chicken + veggies" />
          </div>
          <div className="field" style={{ flex: '1 1 130px' }}>
            <label>Store</label>
            <input list="stores" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} />
            <datalist id="stores">
              {stores.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </datalist>
          </div>
          <div className="field" style={{ flex: '1 1 100px' }}>
            <label>Amount ($)</label>
            <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </div>
          <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
        </form>
        <p className="small muted" style={{ marginTop: 8 }}>
          Tip: also add a matching “Groceries” transaction if you want it counted in the monthly budget.
        </p>
      </div>

      <div className="card">
        <h2>Log</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th>Store</th>
                <th className="num">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {inMonth.map((g) => (
                <tr key={g.id}>
                  <td className="small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(g.date)}</td>
                  <td>{g.item}</td>
                  <td className="small">{g.store}</td>
                  <td className="num">{fmtMoney(g.amount)}</td>
                  <td className="num">
                    <button className="btn danger-ghost" title="Delete" onClick={() => removeItem('groceries', g.id)}>✕</button>
                  </td>
                </tr>
              ))}
              {!inMonth.length && (
                <tr>
                  <td colSpan={5} className="muted">Nothing logged for {monthLabel(month)}.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
