import { NextResponse } from 'next/server';
import { getData, storageMode } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getData();
  return NextResponse.json({ ...data, storage: storageMode() });
}
