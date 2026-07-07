import { NextResponse } from 'next/server';
import { AUTH_COOKIE, pinHash } from '@/lib/auth';

export async function POST(req) {
  const { pin } = await req.json();
  const expected = process.env.APP_PIN;
  if (!expected || String(pin) !== String(expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await pinHash(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 180,
    path: '/',
  });
  return res;
}
