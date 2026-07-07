'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/components/budget-context';
import { catEmoji } from '@/lib/categories';

export default function SettingsPage() {
  const { data, error, setDoc } = useBudget();
  const [budgets, setBudgets] = useState(null);
  const [settings, setSettings] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && budgets === null) {
      setBudgets(data.budgets.map((b) => ({ ...b, budget: b.budget == null ? '' : String(b.budget) })));
      setSettings({
        savingsGoal: String(data.settings.savingsGoal ?? ''),
        monthlySavingsGoal: String(data.settings.monthlySavingsGoal ?? ''),
      });
    }
  }, [data, budgets]);

  if (error) return <p className="neg">⚠ {error}</p>;
  if (!data || !budgets || !settings) return <p className="muted">Loading…</p>;

  const totalBudget = budgets.reduce((s, b) => s + (Number(b.budget) || 0), 0);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(
        'budgets',
        budgets.map((b) => ({ category: b.category, budget: b.budget === '' ? null : Number(b.budget) }))
      );
      await setDoc('settings', {
        ...data.settings,
        savingsGoal: Number(settings.savingsGoal) || 0,
        monthlySavingsGoal: Number(settings.monthlySavingsGoal) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = (e) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name || budgets.some((b) => b.category.toLowerCase() === name.toLowerCase())) return;
    setBudgets([...budgets, { category: name, budget: '' }]);
    setNewCat('');
  };

  return (
    <>
      <div className="page-title">⚙️ Settings</div>
      <div className="page-sub">Monthly budgets per category and savings goals.</div>

      <div className="two-col">
        <div className="card">
          <h2>Category budgets <span className="muted small" style={{ fontWeight: 500 }}>· total ${totalBudget.toFixed(2)}/mo</span></h2>
          {budgets.map((b, i) => (
            <div key={b.category} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ flex: 1 }}>
                {catEmoji(b.category)} {b.category}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="no budget"
                value={b.budget}
                onChange={(e) => setBudgets(budgets.map((x, j) => (j === i ? { ...x, budget: e.target.value } : x)))}
                style={{ width: 110, textAlign: 'right' }}
              />
              <button
                className="btn danger-ghost"
                title="Remove category"
                onClick={() => setBudgets(budgets.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
          <form className="form-row" style={{ marginTop: 12 }} onSubmit={addCategory}>
            <div className="field" style={{ flex: '2 1 160px' }}>
              <label>New category</label>
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Pets" />
            </div>
            <button className="btn" type="submit">Add category</button>
          </form>
        </div>

        <div className="stack">
          <div className="card">
            <h2>Savings goals</h2>
            <div className="form-row">
              <div className="field">
                <label>Total savings goal ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.savingsGoal}
                  onChange={(e) => setSettings({ ...settings, savingsGoal: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Monthly savings goal ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.monthlySavingsGoal}
                  onChange={(e) => setSettings({ ...settings, monthlySavingsGoal: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Data</h2>
            <p className="small" style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
              Storage: <strong>{data.storage === 'cloud' ? '☁️ Cloud (synced across devices)' : data.storage === 'local' ? '💻 Local file (dev mode)' : '⚠ Temporary — connect Upstash Redis in Vercel'}</strong>
            </p>
            <a className="btn" href="/api/data" download="budget-backup.json">⬇ Download JSON backup</a>
          </div>
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 76, marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="pos small">✓ Saved</span>}
      </div>
    </>
  );
}
