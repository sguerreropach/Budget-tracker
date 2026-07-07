export const AUTH_COOKIE = 'budget_auth';

export async function pinHash(pin) {
  const bytes = new TextEncoder().encode(`budget-app:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
