'use client';

import { useMemo, useState } from 'react';
import { useBudget } from '@/components/budget-context';
import MonthPicker from '@/components/MonthPicker';
import { catEmoji } from '@/lib/categories';
import { currentMonthKey, fmtDate, fmtMoney, monthKey, monthLabel, todayStr } from '@/lib/util';

const EMPTY = { date: '', category: '', type: 'Expense', amount: '', notes: '' };

export default function TransactionsPage() {
  const { data, error, addItem, updateItem, removeItem } = useBudget();
  const [month, setMonth] = useState(currentMonthKey());
  const [allMonths, setAllMonths] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...EMPTY, date: todayStr() });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.budgets.map((b) => b.category));
    for (const t of data.transactions) set.add(t.category);
    set.add('Other Income');
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.transactions
      .filter((t) => (allMonths ? true : monthKey(t.date) === month))
      .filter((t) => (catFilter ? t.category === catFilter : true))
      .filter((t) => (search ? (t.notes + ' ' + t.category).toLowerCase().includes(search.toLowerCase()) : true))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [data, month, allMonths, catFilter, search]);

  if (error) return <p className="neg">⚠ {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  const totals = filtered.reduce(
    (acc, t) => {
      if (t.type === 'Income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm({ date: t.date || '', category: t.category, type: t.type, amount: String(t.amount), notes: t.notes || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY, date: todayStr() });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.date) return;
    setSaving(true);
    try {
      const item = {
        date: form.date,
        category: form.category,
        type: form.type,
        amount: Number(form.amount) || 0,
        notes: form.notes,
      };
      if (editingId) await updateItem('transactions', { id: editingId, ...item });
      else await addItem('transactions', item);
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-title">💸 Transactions</div>
      <div className="page-sub">Log every expense and income — the dashboard updates automatically.</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>{editingId ? '✏️ Edit transaction' : '➕ Add transaction'}</h2>
        <form className="form-row" onSubmit={submit}>
          <div className="field" style={{ flex: '1 1 130px' }}>
            <label>Date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field" style={{ flex: '1 1 130px' }}>
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Expense</option>
              <option>Income</option>
            </select>
          </div>
          <div className="field" style={{ flex: '1 1 150px' }}>
            <label>Category</label>
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: '1 1 110px' }}>
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="field" style={{ flex: '2 1 180px' }}>
            <label>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
          </div>
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button className="btn" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="filters">
        <MonthPicker value={month} onChange={(m) => { setMonth(m); setAllMonths(false); }} />
        <label className="small" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={allMonths} onChange={(e) => setAllMonths(e.target.checked)} style={{ minWidth: 0 }} />
          All months
        </label>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: '1 1 140px' }} />
      </div>

      <div className="card">
        <div className="filters" style={{ marginBottom: 10, gap: 16 }}>
          <span className="small muted">{filtered.length} transactions{allMonths ? '' : ` · ${monthLabel(month)}`}</span>
          <span className="small">Expenses: <strong className="neg">{fmtMoney(totals.expense)}</strong></span>
          <span className="small">Income: <strong className="pos">{fmtMoney(totals.income)}</strong></span>
          <span className="small">Net: <strong className={totals.income - totals.expense < 0 ? 'neg' : 'pos'}>{fmtMoney(totals.income - totals.expense)}</strong></span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th className="num">Amount</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {catEmoji(t.category)} {t.category}
                  </td>
                  <td className={`num ${t.type === 'Income' ? 'pos' : ''}`}>
                    {t.type === 'Income' ? fmtMoney(t.amount, { sign: true }) : fmtMoney(-t.amount)}
                  </td>
                  <td className="small" style={{ color: 'var(--text-secondary)' }}>{t.notes}</td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn ghost" title="Edit" onClick={() => startEdit(t)}>✏️</button>
                    <button className="btn danger-ghost" title="Delete" onClick={() => removeItem('transactions', t.id)}>✕</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="muted">No transactions match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
