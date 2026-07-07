'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (window.location.pathname === '/login') return;
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const call = useCallback(
    async (method, collection, body, query = '') => {
      const res = await fetch(`/api/store/${collection}${query}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        await refresh();
        throw new Error('Save failed — please retry');
      }
      return res.json();
    },
    [refresh]
  );

  const addItem = useCallback(
    async (collection, item) => {
      const saved = await call('POST', collection, item);
      setData((d) => ({ ...d, [collection]: [...(d[collection] || []), saved] }));
      return saved;
    },
    [call]
  );

  const updateItem = useCallback(
    async (collection, item) => {
      const saved = await call('PUT', collection, item);
      setData((d) => ({
        ...d,
        [collection]: (d[collection] || []).map((x) => (x.id === saved.id ? saved : x)),
      }));
      return saved;
    },
    [call]
  );

  const removeItem = useCallback(
    async (collection, id) => {
      await call('DELETE', collection, null, `?id=${encodeURIComponent(id)}`);
      setData((d) => ({
        ...d,
        [collection]: (d[collection] || []).filter((x) => x.id !== id),
      }));
    },
    [call]
  );

  const setDoc = useCallback(
    async (collection, value) => {
      const saved = await call('PUT', collection, value);
      setData((d) => ({ ...d, [collection]: saved }));
    },
    [call]
  );

  return (
    <BudgetContext.Provider value={{ data, error, refresh, addItem, updateItem, removeItem, setDoc }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
