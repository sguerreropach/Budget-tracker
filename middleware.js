import { NextResponse } from 'next/server';
import { AUTH_COOKIE, pinHash } from '@/lib/auth';

export async function middleware(req) {
  const pin = process.env.APP_PIN;
  if (!pin) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie && cookie === (await pinHash(pin))) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|icon|manifest|favicon).*)'],
};
