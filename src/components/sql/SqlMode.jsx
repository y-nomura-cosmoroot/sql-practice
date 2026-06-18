import { useEffect, useState } from 'react';
import problems from '../../data/sqlProblems.json';
import { buildSql } from '../../lib/buildSql.js';
import { compareResults } from '../../lib/compareResults.js';
import Message from '../common/Message.jsx';
import InfoModal from '../common/InfoModal.jsx';
import BuildArea from './BuildArea.jsx';
import Palette from './Palette.jsx';
import SchemaView from './SchemaView.jsx';
import ResultPopup from './ResultPopup.jsx';

export default function SqlMode({ db, hidden, set }) {
  const { current, solved, solvedCount, total, markSolved, markWrong, nextUnsolved } = set;
  const problem = problems[current];

  const [tokens, setTokens] = useState([]);
  const [cursor, setCursor] = useState(0); // 挿入位置（0..tokens.length）
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null); // { label, table, emptyText }
  const [popup, setPopup] = useState(null); // { kind: 'run'|'check', correct }
  const [info, setInfo] = useState(null); // { title, kind, text }

  // 問題が変わったら作業状態をリセット。
  useEffect(() => {
    setTokens([]);
    setCursor(0);
    setMessage(null);
    setResult(null);
    setPopup(null);
  }, [current]);

  const sql = buildSql(tokens).trim();

  // 現在の挿入位置（cursor）に部品を挿入し、カーソルを1つ進める。
  const insertToken = (t) => {
    setTokens((ts) => [...ts.slice(0, cursor), t, ...ts.slice(cursor)]);
    setCursor((c) => c + 1);
  };
  // チップ削除。削除位置より後ろにカーソルがあれば1つ手前へずらす。
  const removeToken = (i) => {
    setTokens((ts) => ts.filter((_, idx) => idx !== i));
    setCursor((c) => (c > i ? c - 1 : c));
  };
  const clear = () => {
    setTokens([]);
    setCursor(0);
  };
  // カーソルを左右に動かす（範囲は 0..tokens.length）。
  const moveCursor = (delta) =>
    setCursor((c) => Math.max(0, Math.min(tokens.length, c + delta)));

  const runQuery = () => {
    setMessage(null);
    if (!sql) {
      setMessage({ kind: 'info', text: '部品を選んでSQLを組み立ててください。' });
      return;
    }
    try {
      const r = db.exec(sql);
      setResult(
        r.length
          ? { label: `実行結果（${r[0].values.length}行）`, table: r[0], emptyText: null }
          : { label: null, table: null, emptyText: '実行しました（返ってきた行はありません）。' }
      );
      setPopup({ kind: 'run' });
    } catch (e) {
      setMessage({ kind: 'err', text: `⚠ SQLエラー: ${e.message}` });
    }
  };

  const checkAnswer = () => {
    setMessage(null);
    if (!sql) {
      setMessage({ kind: 'info', text: '部品を選んでSQLを組み立ててください。' });
      return;
    }
    let u;
    try {
      u = db.exec(sql);
    } catch (e) {
      setMessage({ kind: 'err', text: `⚠ SQLエラー: ${e.message}` });
      return;
    }
    let a;
    try {
      a = db.exec(problem.answer);
    } catch (e) {
      setMessage({ kind: 'err', text: `解答例エラー: ${e.message}` });
      return;
    }
    const uu = u.length ? u[0] : { columns: [], values: [] };
    const aa = a.length ? a[0] : { columns: [], values: [] };
    const correct = compareResults(uu, aa);

    setResult(
      uu.values.length
        ? { label: `あなたの結果（${uu.values.length}行）`, table: uu, emptyText: null }
        : { label: 'あなたの結果', table: null, emptyText: '返ってきた行はありません。' }
    );

    if (correct) markSolved(current);
    else markWrong(current);

    setPopup({ kind: 'check', correct });
  };

  const closePopup = () => setPopup(null);
  // 正解（永続的に解決済み）なら次の未解決問題へ。不正解時は閉じるだけ。
  const handleNext = () => {
    setPopup(null);
    if (solved[current]) nextUnsolved();
  };
  const allDone = popup?.kind === 'check' && !!popup?.correct && solvedCount === total;

  return (
    <div className="mode-view mode-view-sql" style={{ display: hidden ? 'none' : 'block' }}>
      {/* 問題：1カラム（全幅）。問題番号・レベルは左サイドバーのメニューに表示。 */}
      <div className="panel">
        <div className="question">
          <span className="question-chip">問題 {current + 1}</span>
          {problem.q}
        </div>
      </div>

      {/* テーブル構成 ｜ 部品パレット の2カラム */}
      <div className="layout">
        <div className="col-left">
          <div className="panel">
            <SchemaView db={db} onPick={insertToken} />
          </div>
        </div>
        <div className="col-right">
          <div className="panel">
            <h2>SQL部品</h2>
            <Palette onPick={insertToken} />
          </div>
        </div>
      </div>

      {/* SQL組み立て～挿入位置＋アクションボタンを下部に固定（右カラム幅に一致） */}
      <div className="composer-dock">
        <div className="composer-dock-inner">
          <div className="composer-panel">
            <h2>組み立てたSQL</h2>
            <BuildArea tokens={tokens} cursor={cursor} onRemove={removeToken} />
            <div className="caret-controls">
              <span className="caret-controls-label">挿入位置</span>
              <button
                type="button"
                className="caret-btn"
                onClick={() => setCursor(0)}
                disabled={cursor === 0}
                aria-label="カーソルを先頭へ"
              >
                最初
              </button>
              <button
                type="button"
                className="caret-btn"
                onClick={() => moveCursor(-1)}
                disabled={cursor === 0}
                aria-label="カーソルを左へ"
              >
                ◀
              </button>
              <span className="caret-pos">
                {cursor} / {tokens.length}
              </span>
              <button
                type="button"
                className="caret-btn"
                onClick={() => moveCursor(1)}
                disabled={cursor === tokens.length}
                aria-label="カーソルを右へ"
              >
                ▶
              </button>
              <button
                type="button"
                className="caret-btn"
                onClick={() => setCursor(tokens.length)}
                disabled={cursor === tokens.length}
                aria-label="カーソルを末尾へ"
              >
                最後
              </button>
            </div>
            <div className="btn-row composer-actions">
              <button className="action btn-run" onClick={runQuery}>
                ▶ 実行
              </button>
              <button className="action btn-check" onClick={checkAnswer}>
                ✓ 答え合わせ
              </button>
              <button className="action btn-del" onClick={clear}>
                クリア
              </button>
              <button
                className="action btn-ghost"
                onClick={() => setInfo({ title: 'ヒント', kind: 'hint', text: problem.hint })}
              >
                ヒント
              </button>
              <button
                className="action btn-ghost"
                onClick={() => setInfo({ title: '解答例', kind: 'answer', text: problem.answer })}
              >
                解答例
              </button>
            </div>
            <Message message={message} />
          </div>
        </div>
      </div>

      <ResultPopup
        open={!!popup}
        kind={popup?.kind}
        result={result}
        correct={!!popup?.correct}
        allDone={allDone}
        solvedCount={solvedCount}
        total={total}
        onNext={handleNext}
        onClose={closePopup}
      />
      <InfoModal info={info} onClose={() => setInfo(null)} />
    </div>
  );
}
