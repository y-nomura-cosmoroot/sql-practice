const MODES = [
  { key: 'sql', label: 'SQL' },
  { key: 'design', label: '設計' },
];

export default function Header({ mode, onModeChange }) {
  return (
    <header>
      <h1>SQL &amp; DB Design Practice</h1>
      <div className="subtitle">
        部品を選んでSQLを組み立てたり、要件からテーブル設計を組み立てて判定できます。文字入力は不要です。
      </div>
      <div className="mode-tabs">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-tab${mode === m.key ? ' active' : ''}`}
            onClick={() => onModeChange(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
