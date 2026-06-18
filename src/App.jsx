import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import SqlMode from './components/sql/SqlMode.jsx';
import DesignMode from './components/design/DesignMode.jsx';
import { useSqlDb } from './hooks/useSqlDb.js';
import { useProblemSet } from './hooks/useProblemSet.js';
import sqlProblems from './data/sqlProblems.json';
import designProblems from './data/designProblems.json';

export default function App() {
  const [mode, setMode] = useState('sql');
  const { db, loading, error } = useSqlDb();

  // 問題セットの状態は App に持ち上げ、サイドバー（ナビ）と各モード（中身）で共有する。
  const sqlSet = useProblemSet(sqlProblems.length);
  const designSet = useProblemSet(designProblems.length);
  const sets = { sql: sqlSet, design: designSet };

  // サイドバーから問題を選ぶと、そのモードに切り替えて該当問題へ移動する。
  const selectProblem = (modeKey, i) => {
    setMode(modeKey);
    sets[modeKey].goTo(i);
  };

  return (
    <div className="wrap">
      <header className="app-header">
        <h1>SQL &amp; DB Design Practice</h1>
        <div className="app-header-meta">
          <span className="app-author">by yusuke nomura</span>
          <a
            className="app-repo-link"
            href="https://github.com/y-nomura-cosmoroot/sql-practice"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      <div className="app-shell">
        <Sidebar
          mode={mode}
          sets={sets}
          onModeChange={setMode}
          onSelectProblem={selectProblem}
        />

        <main className="main-content">
          {loading && <div className="loading">Loading SQL Engine...</div>}
          {error && <div className="loading">読み込みに失敗しました: {error.message}</div>}

          {db && (
            <>
              {/* 両モードを常にマウントしておき、表示だけ切り替える（状態を保持）。 */}
              <SqlMode db={db} hidden={mode !== 'sql'} set={sqlSet} />
              <DesignMode hidden={mode !== 'design'} set={designSet} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
