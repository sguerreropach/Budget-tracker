export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : '';
}

export function monthLabel(key) {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmtMoney(n, { sign = false } = {}) {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n < 0) return `($${abs})`;
  return `${sign && n > 0 ? '+' : ''}$${abs}`;
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
}

// Months until a loan is paid off with a fixed monthly payment; null if never.
export function monthsToPayoff(balance, annualRate, payment) {
  if (!balance || balance <= 0) return 0;
  if (!payment || payment <= 0) return null;
  const r = (annualRate || 0) / 12;
  let bal = balance;
  for (let i = 1; i <= 600; i++) {
    bal = bal * (1 + r) - payment;
    if (bal <= 0) return i;
  }
  return null;
}

export function payoffSchedule(balance, annualRate, payment, startDate = new Date()) {
  const rows = [];
  const r = (annualRate || 0) / 12;
  let bal = balance;
  if (!payment || payment <= 0 || !balance || balance <= 0) return rows;
  for (let i = 1; i <= 600 && bal > 0; i++) {
    const interest = bal * r;
    const principal = Math.min(payment - interest, bal);
    if (principal <= 0) break;
    bal = Math.max(0, bal + interest - payment);
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
    rows.push({
      month: i,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      interest,
      principal,
      balance: bal,
    });
  }
  return rows;
}
