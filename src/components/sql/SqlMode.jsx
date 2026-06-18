import { useEffect, useState } from 'react';
import problems from '../../data/sqlProblems.json';
import { useProblemSet } from '../../hooks/useProblemSet.js';
import { buildSql } from '../../lib/buildSql.js';
import { compareResults } from '../../lib/compareResults.js';
import LevelBadge from '../common/LevelBadge.jsx';
import ProblemNav from '../common/ProblemNav.jsx';
import Tabs from '../common/Tabs.jsx';
import Message from '../common/Message.jsx';
import ResultModal from '../common/ResultModal.jsx';
import InfoModal from '../common/InfoModal.jsx';
import BuildArea from './BuildArea.jsx';
import Palette from './Palette.jsx';
import SchemaView from './SchemaView.jsx';
import ResultView from './ResultView.jsx';

const TABS = [
  { key: 'schema', label: 'テーブル構成' },
  { key: 'result', label: 'あなたの結果' },
];

export default function SqlMode({ db, hidden }) {
  const { current, solved, solvedCount, total, goTo, markSolved, nextUnsolved } = useProblemSet(
    problems.length
  );
  const problem = problems[current];

  const [tokens, setTokens] = useState([]);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null); // { label, table, emptyText }
  const [activeTab, setActiveTab] = useState('schema');
  const [flash, setFlash] = useState(0);
  const [info, setInfo] = useState(null); // { title, kind, text }
  const [modal, setModal] = useState(null); // { correct }

  // 問題が変わったら作業状態をリセット（元アプリ loadProblem 相当）。
  useEffect(() => {
    setTokens([]);
    setMessage(null);
    setResult(null);
    setActiveTab('schema');
  }, [current]);

  const sql = buildSql(tokens).trim();

  const pushToken = (t) => setTokens((ts) => [...ts, t]);
  const removeToken = (i) => setTokens((ts) => ts.filter((_, idx) => idx !== i));
  const undo = () => setTokens((ts) => ts.slice(0, -1));
  const clear = () => setTokens([]);

  const showResultTab = () => {
    setActiveTab('result');
    setFlash((f) => f + 1);
  };

  const runQuery = () => {
    setMessage(null);
    setResult(null);
    if (!sql) {
      setMessage({ kind: 'info', text: '部品を選んでSQLを組み立ててください。' });
      return;
    }
    try {
      const r = db.exec(sql);
      if (r.length) {
        setResult({ label: `実行結果（${r[0].values.length}行）`, table: r[0], emptyText: null });
      } else {
        setResult({ label: null, table: null, emptyText: '実行しました（返ってきた行はありません）。' });
      }
      showResultTab();
    } catch (e) {
      setMessage({ kind: 'err', text: `⚠ SQLエラー: ${e.message}` });
    }
  };

  const checkAnswer = () => {
    setMessage(null);
    setResult(null);
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

    if (uu.values.length) {
      setResult({ label: `あなたの結果（${uu.values.length}行）`, table: uu, emptyText: null });
    } else {
      setResult({ label: 'あなたの結果', table: null, emptyText: '返ってきた行はありません。' });
    }
    showResultTab();

    if (correct) {
      markSolved(current);
      setMessage({ kind: 'ok', text: '🎉 正解です！結果が一致しました。' });
    } else {
      setMessage({ kind: 'ng', text: '❌ 不正解です。期待される結果と一致しませんでした。' });
    }
    setModal({ correct });
  };

  const closeModal = () => setModal(null);
  // 元アプリと同じく、現在の問題が（永続的に）解決済みなら次の未解決問題へ進む。
  // 解決済みの問題に再挑戦して不正解だった場合も「次へ」進む挙動を再現する。
  const handleNext = () => {
    setModal(null);
    if (solved[current]) nextUnsolved();
  };
  const allDone = !!modal?.correct && solvedCount === total;

  return (
    <div className="layout" style={{ display: hidden ? 'none' : 'grid' }}>
      <div className="col-left">
        <div className="panel">
          <h2>問題</h2>
          <ProblemNav count={total} current={current} solved={solved} onSelect={goTo} />
          <div>
            <LevelBadge cls={problem.cls} label={problem.levelLabel} />
          </div>
          <div className="question">
            問題 {current + 1}. {problem.q}
          </div>
          <div className="progress">
            SOLVED: {solvedCount} / {total}
          </div>
        </div>

        <div className="panel">
          <h2>SQLを組み立てる</h2>
          <BuildArea tokens={tokens} onRemove={removeToken} />
          <div className="btn-row">
            <button className="action btn-run" onClick={runQuery}>
              ▶ 実行
            </button>
            <button className="action btn-check" onClick={checkAnswer}>
              ✓ 答え合わせ
            </button>
            <button className="action btn-del" onClick={undo}>
              ⌫ 戻す
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
          <h2 className="palette-heading">部品パレット</h2>
          <Palette onPick={pushToken} />
          <Message message={message} />
        </div>
      </div>

      <div className="col-right">
        <div className="panel">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} flashSignal={flash} />
          <div className="tab-body" style={{ display: activeTab === 'schema' ? 'block' : 'none' }}>
            <SchemaView db={db} />
          </div>
          <div className="tab-body" style={{ display: activeTab === 'result' ? 'block' : 'none' }}>
            <ResultView result={result} />
          </div>
        </div>
      </div>

      <ResultModal
        open={!!modal}
        correct={!!modal?.correct}
        allDone={allDone}
        solvedCount={solvedCount}
        total={total}
        modeType="sql"
        onNext={handleNext}
        onClose={closeModal}
      />
      <InfoModal info={info} onClose={() => setInfo(null)} />
    </div>
  );
}
