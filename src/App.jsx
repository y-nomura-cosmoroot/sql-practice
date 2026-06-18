import { useState } from 'react';
import Header from './components/Header.jsx';
import SqlMode from './components/sql/SqlMode.jsx';
import DesignMode from './components/design/DesignMode.jsx';
import { useSqlDb } from './hooks/useSqlDb.js';

export default function App() {
  const [mode, setMode] = useState('sql');
  const { db, loading, error } = useSqlDb();

  return (
    <div className="wrap">
      <Header mode={mode} onModeChange={setMode} />

      {loading && <div className="loading">Loading SQL Engine...</div>}
      {error && <div className="loading">読み込みに失敗しました: {error.message}</div>}

      {db && (
        <>
          {/* 両モードを常にマウントしておき、表示だけ切り替える（状態を保持）。 */}
          <SqlMode db={db} hidden={mode !== 'sql'} />
          <DesignMode hidden={mode !== 'design'} />
        </>
      )}
    </div>
  );
}
