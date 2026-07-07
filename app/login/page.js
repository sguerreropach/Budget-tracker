'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(false);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      // full reload so the data provider refetches with the new cookie
      window.location.href = '/';
    } else {
      setBusy(false);
      setErr(true);
      setPin('');
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <div style={{ fontSize: 40 }}>💰</div>
        <h1 style={{ fontSize: 19, margin: '8px 0 2px' }}>Personal Budget</h1>
        <p className="muted small">Enter your PIN to continue</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          aria-label="PIN"
        />
        {err && <p className="neg small" style={{ marginBottom: 10 }}>Wrong PIN — try again</p>}
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy || !pin}>
          {busy ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
