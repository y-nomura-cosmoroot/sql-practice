import sqlProblems from '../data/sqlProblems.json';
import designProblems from '../data/designProblems.json';

const SECTIONS = [
  { key: 'sql', label: 'SQL', problems: sqlProblems },
  { key: 'design', label: '設計', problems: designProblems },
];

/**
 * 左サイドバー。SQL / 設計 の各見出しにマウスオーバー、またはクリックして
 * アクティブにすると、その配下に問題一覧（番号＋レベル）が開く。
 * 問題をクリックするとそのモードに切り替えて該当問題へ移動する。
 *
 * @param {{
 *   mode: 'sql'|'design',
 *   sets: { sql: object, design: object },   // useProblemSet の戻り値
 *   onModeChange: (key:string)=>void,
 *   onSelectProblem: (key:string, index:number)=>void,
 * }} props
 */
export default function Sidebar({ mode, sets, onModeChange, onSelectProblem }) {
  return (
    <aside className="sidebar">
      <nav className="mode-nav">
        {SECTIONS.map((s) => {
          const set = sets[s.key];
          const isActive = mode === s.key;
          return (
            <div key={s.key} className={`nav-section${isActive ? ' active' : ''}`}>
              <button
                className={`mode-nav-item${isActive ? ' active' : ''}`}
                onClick={() => onModeChange(s.key)}
              >
                <span className="mode-nav-label">{s.label}</span>
                <span className="mode-nav-progress">
                  正解: {set.solvedCount} / {set.total}
                </span>
              </button>
              <ul className="nav-sublist">
                {s.problems.map((p, i) => {
                  const isCurrent = isActive && set.current === i;
                  return (
                    <li key={i}>
                      <button
                        className={`nav-problem${isCurrent ? ' current' : ''}`}
                        onClick={() => onSelectProblem(s.key, i)}
                      >
                        <span className="nav-problem-num">{i + 1}</span>
                        <span className="nav-problem-label">{p.levelLabel}</span>
                        {set.solved[i] ? (
                          <span className="nav-problem-check">✓</span>
                        ) : set.wrong[i] ? (
                          <span className="nav-problem-cross">✕</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
