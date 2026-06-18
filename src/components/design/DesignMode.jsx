import { useEffect, useState } from 'react';
import designProblems from '../../data/designProblems.json';
import typeOptions from '../../data/typeOptions.json';
import { useProblemSet } from '../../hooks/useProblemSet.js';
import { checkDesign } from '../../lib/checkDesign.js';
import LevelBadge from '../common/LevelBadge.jsx';
import ProblemNav from '../common/ProblemNav.jsx';
import Tabs from '../common/Tabs.jsx';
import Message from '../common/Message.jsx';
import ResultModal from '../common/ResultModal.jsx';
import InfoModal from '../common/InfoModal.jsx';
import TableCard from './TableCard.jsx';
import DesignPreview from './DesignPreview.jsx';
import DesignResult from './DesignResult.jsx';

const TABS = [
  { key: 'preview', label: '設計プレビュー' },
  { key: 'result', label: '判定結果' },
];

export default function DesignMode({ hidden }) {
  const { current, solved, solvedCount, total, goTo, markSolved, nextUnsolved } = useProblemSet(
    designProblems.length
  );
  const problem = designProblems[current];

  const [design, setDesign] = useState([]); // [{ name, columns: [{name,type,pk,ref}] }]
  const [message, setMessage] = useState(null);
  const [checks, setChecks] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [flash, setFlash] = useState(0);
  const [info, setInfo] = useState(null);
  const [modal, setModal] = useState(null);

  // 課題が変わったら作業状態をリセット（元アプリ loadDProblem 相当）。
  useEffect(() => {
    setDesign([]);
    setMessage(null);
    setChecks(null);
    setActiveTab('preview');
  }, [current]);

  // 設計のイミュータブルな更新ヘルパー。
  const addTable = (name) => setDesign((d) => [...d, { name, columns: [] }]);
  const removeTable = (ti) => setDesign((d) => d.filter((_, i) => i !== ti));
  const addColumn = (ti, colName) =>
    setDesign((d) =>
      d.map((t, i) =>
        i === ti
          ? { ...t, columns: [...t.columns, { name: colName, type: 'INTEGER', pk: false, ref: '' }] }
          : t
      )
    );
  const removeColumn = (ti, ci) =>
    setDesign((d) =>
      d.map((t, i) => (i === ti ? { ...t, columns: t.columns.filter((_, j) => j !== ci) } : t))
    );
  const updateColumn = (ti, ci, patch) =>
    setDesign((d) =>
      d.map((t, i) =>
        i === ti
          ? { ...t, columns: t.columns.map((c, j) => (j === ci ? { ...c, ...patch } : c)) }
          : t
      )
    );

  const usedTables = design.map((t) => t.name);
  const availableTables = problem.tablePool.filter((n) => !usedTables.includes(n));

  const runCheck = () => {
    if (!design.length) {
      setMessage({ kind: 'info', text: 'テーブルを追加して設計を組み立ててください。' });
      return;
    }
    const { checks: result, allOk } = checkDesign(design, problem.answer);
    setChecks(result);
    setActiveTab('result');
    setFlash((f) => f + 1);

    if (allOk) {
      markSolved(current);
      setMessage({ kind: 'ok', text: '🎉 正しく正規化された設計です！' });
    } else {
      setMessage({
        kind: 'ng',
        text: '❌ まだ改善点があります。「判定結果」タブの ✗ 項目を確認してください。',
      });
    }
    setModal({ correct: allOk });
  };

  const clear = () => {
    setDesign([]);
    setMessage(null);
  };

  const closeModal = () => setModal(null);
  // 元アプリと同じく、現在の課題が（永続的に）解決済みなら次の未解決課題へ進む。
  const handleNext = () => {
    setModal(null);
    if (solved[current]) nextUnsolved();
  };
  const allDone = !!modal?.correct && solvedCount === total;

  return (
    <div className="layout" style={{ display: hidden ? 'none' : 'grid' }}>
      <div className="col-left">
        <div className="panel">
          <h2>設計課題</h2>
          <ProblemNav count={total} current={current} solved={solved} onSelect={goTo} />
          <div>
            <LevelBadge cls={problem.cls} label={problem.levelLabel} />
          </div>
          <div className="question">
            課題 {current + 1}. {problem.q}
          </div>
          <div className="progress">
            SOLVED: {solvedCount} / {total}
          </div>
          <div className="btn-row">
            <button className="action btn-check" onClick={runCheck}>
              ✓ 設計を判定
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
              onClick={() => setInfo({ title: '模範解答', kind: 'answer', text: problem.model })}
            >
              模範解答
            </button>
          </div>
          <Message message={message} />
        </div>

        <div className="panel">
          <h2>テーブルを設計する</h2>
          <div>
            {design.length === 0 ? (
              <div className="placeholder-hint">下の「テーブルを追加」から始めましょう。</div>
            ) : (
              design.map((t, ti) => (
                <TableCard
                  key={t.name}
                  table={t}
                  ti={ti}
                  columnPool={(problem.columnPool[t.name] || []).filter(
                    (c) => !t.columns.some((uc) => uc.name === c)
                  )}
                  otherTables={design.map((x) => x.name).filter((n) => n !== t.name)}
                  typeOptions={typeOptions}
                  onRemoveTable={removeTable}
                  onAddColumn={addColumn}
                  onRemoveColumn={removeColumn}
                  onUpdateColumn={updateColumn}
                />
              ))
            )}
          </div>
          <div className="d-addtable-section">
            <div className="pal-title">テーブルを追加</div>
            <div className="d-addtable">
              {availableTables.length ? (
                availableTables.map((n) => (
                  <button key={n} className="d-tablepill" onClick={() => addTable(n)}>
                    + {n}
                  </button>
                ))
              ) : (
                <span className="placeholder-hint">追加できるテーブルはありません</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-right">
        <div className="panel">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} flashSignal={flash} />
          <div className="tab-body" style={{ display: activeTab === 'preview' ? 'block' : 'none' }}>
            <DesignPreview design={design} />
          </div>
          <div className="tab-body" style={{ display: activeTab === 'result' ? 'block' : 'none' }}>
            <DesignResult checks={checks} />
          </div>
        </div>
      </div>

      <ResultModal
        open={!!modal}
        correct={!!modal?.correct}
        allDone={allDone}
        solvedCount={solvedCount}
        total={total}
        modeType="design"
        onNext={handleNext}
        onClose={closeModal}
      />
      <InfoModal info={info} onClose={() => setInfo(null)} />
    </div>
  );
}
