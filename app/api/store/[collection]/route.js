import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/store';

export const dynamic = 'force-dynamic';

const LISTS = new Set(['transactions', 'groceries', 'savings', 'ious', 'loans']);
const DOCS = new Set(['settings', 'budgets']);

function bad(msg, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req, { params }) {
  const { collection } = await params;
  if (!LISTS.has(collection)) return bad('unknown collection');
  const item = await req.json();
  item.id = crypto.randomUUID();
  const data = await getData();
  data[collection] = [...(data[collection] || []), item];
  await saveData(data);
  return NextResponse.json(item);
}

export async function PUT(req, { params }) {
  const { collection } = await params;
  const body = await req.json();
  const data = await getData();

  if (DOCS.has(collection)) {
    data[collection] = body;
    await saveData(data);
    return NextResponse.json(body);
  }
  if (!LISTS.has(collection)) return bad('unknown collection');

  const list = data[collection] || [];
  const idx = list.findIndex((x) => x.id === body.id);
  if (idx === -1) return bad('not found', 404);
  list[idx] = { ...list[idx], ...body };
  data[collection] = list;
  await saveData(data);
  return NextResponse.json(list[idx]);
}

export async function DELETE(req, { params }) {
  const { collection } = await params;
  if (!LISTS.has(collection)) return bad('unknown collection');
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return bad('missing id');
  const data = await getData();
  data[collection] = (data[collection] || []).filter((x) => x.id !== id);
  await saveData(data);
  return NextResponse.json({ ok: true });
}
