import { useEffect, useState } from 'react';
import setupSql from '../data/setup.sql?raw';

const SQLJS_VERSION = '1.8.0';
const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VERSION}`;

// sql.js（WASM）のローダースクリプトを一度だけ読み込む。
function loadSqlJsScript() {
  if (typeof window.initSqlJs === 'function') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sqljs]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('sql.js の読み込みに失敗しました')));
      return;
    }
    const script = document.createElement('script');
    script.src = `${CDN_BASE}/sql-wasm.min.js`;
    script.dataset.sqljs = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('sql.js の読み込みに失敗しました'));
    document.head.appendChild(script);
  });
}

/**
 * sql.js を初期化し、サンプルデータを投入した DB を返すフック。
 * @returns {{ db: import('sql.js').Database | null, loading: boolean, error: Error | null }}
 */
export function useSqlDb() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadSqlJsScript()
      .then(() => window.initSqlJs({ locateFile: (f) => `${CDN_BASE}/${f}` }))
      .then((SQL) => {
        if (cancelled) return;
        const database = new SQL.Database();
        database.run(setupSql);
        setDb(database);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { db, loading: !db && !error, error };
}
