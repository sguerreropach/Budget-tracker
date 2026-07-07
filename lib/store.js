import { promises as fs } from 'fs';
import path from 'path';
import seed from '@/data/seed.json';

const KEY = 'budget:data';

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKV = Boolean(kvUrl && kvToken);

// On Vercel the filesystem is ephemeral; only /tmp is writable.
const FILE = process.env.VERCEL
  ? path.join('/tmp', 'budget-db.json')
  : path.join(process.cwd(), 'data', 'db.json');

export function storageMode() {
  if (hasKV) return 'cloud';
  return process.env.VERCEL ? 'ephemeral' : 'local';
}

async function kvGet() {
  const res = await fetch(`${kvUrl}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`KV read failed: ${res.status}`);
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

async function kvSet(data) {
  const res = await fetch(`${kvUrl}/set/${KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`KV write failed: ${res.status}`);
}

async function fileGet() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function fileSet(data) {
  await fs.writeFile(FILE, JSON.stringify(data), 'utf8');
}

export async function getData() {
  let data = hasKV ? await kvGet() : await fileGet();
  if (!data) {
    data = seed;
    await saveData(data);
  }
  return data;
}

export async function saveData(data) {
  if (hasKV) await kvSet(data);
  else await fileSet(data);
}
