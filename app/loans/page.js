'use client';

import { useState } from 'react';
import { useBudget } from '@/components/budget-context';
import { fmtMoney, monthLabel, monthsToPayoff, payoffSchedule } from '@/lib/util';

function LoanCard({ loan, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: loan.name || '',
    balance: String(loan.balance ?? ''),
    ratePct: String(((loan.rate ?? 0) * 100).toFixed(2).replace(/\.?0+$/, '')),
    minPayment: String(loan.minPayment ?? ''),
    monthlyPayment: String(loan.monthlyPayment ?? ''),
  });
  const [dirty, setDirty] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const balance = Number(form.balance) || 0;
  const rate = (Number(form.ratePct) || 0) / 100;
  const payment = Number(form.monthlyPayment) || 0;

  const months = monthsToPayoff(balance, rate, payment);
  const schedule = payoffSchedule(balance, rate, payment);
  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
  const monthlyInterest = (balance * rate) / 12;
  const payoffDate = schedule.length ? monthLabel(schedule[schedule.length - 1].date) : null;

  const set = (k, v) => {
    setForm({ ...form, [k]: v });
    setDirty(true);
  };

  const save = async () => {
    await onSave({
      id: loan.id,
      name: form.name,
      balance,
      rate,
      minPayment: Number(form.minPayment) || 0,
      monthlyPayment: payment,
    });
    setDirty(false);
  };

  return (
    <div className="card">
      <div className="filters" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ marginBottom: 0 }}>🎓 {form.name || 'Loan'}</h2>
        <button className="btn danger-ghost" title="Delete loan" onClick={() => onDelete(loan.id)}>✕</button>
      </div>

      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="field" style={{ flex: '2 1 150px' }}>
          <label>Name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Balance ($)</label>
          <input type="number" step="0.01" value={form.balance} onChange={(e) => set('balance', e.target.value)} />
        </div>
        <div className="field">
          <label>Interest rate (%/yr)</label>
          <input type="number" step="0.01" value={form.ratePct} onChange={(e) => set('ratePct', e.target.value)} />
        </div>
        <div className="field">
          <label>Min. payment ($)</label>
          <input type="number" step="0.01" value={form.minPayment} onChange={(e) => set('minPayment', e.target.value)} />
        </div>
        <div className="field">
          <label>Monthly payment ($)</label>
          <input type="number" step="0.01" value={form.monthlyPayment} onChange={(e) => set('monthlyPayment', e.target.value)} />
        </div>
        {dirty && (
          <button className="btn primary" onClick={save}>Save</button>
        )}
      </div>

      <div className="grid-tiles" style={{ marginBottom: 4 }}>
        <div className="tile">
          <div className="label">Months to payoff</div>
          <div className="value">{months == null ? '∞' : months}</div>
          {payoffDate && <div className="hint">paid off {payoffDate}</div>}
          {months == null && <div className="hint neg">payment doesn’t cover interest</div>}
        </div>
        <div className="tile">
          <div className="label">Monthly interest</div>
          <div className="value">{fmtMoney(monthlyInterest)}</div>
          <div className="hint">{payment > 0 ? `${((monthlyInterest / payment) * 100).toFixed(1)}% of payment` : ''}</div>
        </div>
        <div className="tile">
          <div className="label">Principal / month</div>
          <div className="value">{fmtMoney(Math.max(0, payment - monthlyInterest))}</div>
        </div>
        <div className="tile">
          <div className="label">Interest until payoff</div>
          <div className="value">{fmtMoney(totalInterest)}</div>
        </div>
      </div>

      {schedule.length > 0 && (
        <>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => setShowSchedule(!showSchedule)}>
            {showSchedule ? 'Hide' : 'Show'} payoff schedule
          </button>
          {showSchedule && (
            <div className="table-wrap" style={{ marginTop: 10, maxHeight: 340, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th className="num">Interest</th>
                    <th className="num">Principal</th>
                    <th className="num">Balance left</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((r) => (
                    <tr key={r.month}>
                      <td className="muted small">{r.month}</td>
                      <td className="small">{monthLabel(r.date)}</td>
                      <td className="num">{fmtMoney(r.interest)}</td>
                      <td className="num">{fmtMoney(r.principal)}</td>
                      <td className="num">{fmtMoney(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function LoansPage() {
  const { data, error, addItem, updateItem, removeItem } = useBudget();

  if (error) return <p className="neg">⚠ {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  const addLoan = () =>
    addItem('loans', { name: 'New loan', balance: 0, rate: 0, minPayment: 0, monthlyPayment: 0 });

  const deleteLoan = (id) => {
    if (confirm('Delete this loan?')) removeItem('loans', id);
  };

  const totalBalance = data.loans.reduce((s, l) => s + (l.balance || 0), 0);

  return (
    <>
      <div className="filters" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">🎓 Loans &amp; debt</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Total balance: <strong>{fmtMoney(totalBalance)}</strong>
          </div>
        </div>
        <button className="btn primary" onClick={addLoan}>➕ Add loan</button>
      </div>

      <div className="stack" style={{ marginTop: 16 }}>
        {data.loans.map((l) => (
          <LoanCard key={l.id} loan={l} onSave={(x) => updateItem('loans', x)} onDelete={deleteLoan} />
        ))}
        {!data.loans.length && (
          <div className="card muted">No loans — congratulations, you’re debt-free 🎉</div>
        )}
      </div>
    </>
  );
}
