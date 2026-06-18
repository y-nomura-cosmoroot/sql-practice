import Overlay from './Overlay.jsx';

// モードごとに文言だけが変わるので、ここに集約（DRY）。
const COPY = {
  sql: {
    correct: '結果が一致しました。よくできました！',
    wrong: '期待される結果と一致しませんでした。ヒントや解答例も活用しましょう。',
  },
  design: {
    correct: '正しく正規化された設計です！',
    wrong: '改善点があります。判定結果の ✗ 項目を確認しましょう。',
  },
};

/**
 * 正誤ポップアップ（SQL・設計モード共通）。
 *
 * @param {{
 *   open:boolean, correct:boolean, allDone:boolean,
 *   solvedCount:number, total:number, modeType:'sql'|'design',
 *   onNext:()=>void, onClose:()=>void
 * }} props
 */
export default function ResultModal({
  open,
  correct,
  allDone,
  solvedCount,
  total,
  modeType,
  onNext,
  onClose,
}) {
  const copy = COPY[modeType];
  const emoji = !correct ? '❌' : allDone ? '🏆' : '🎉';
  const title = !correct ? '不正解' : allDone ? '全問クリア！' : '正解！';
  const body = !correct ? copy.wrong : allDone ? 'すべてクリアしました。お見事です！' : copy.correct;
  const nextLabel = correct ? '次へ →' : 'もう一度挑戦';

  return (
    <Overlay open={open} onClose={onClose}>
      <div className={`modal${correct ? '' : ' ng'}`}>
        <div className="emoji">{emoji}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="modal-progress">
          SOLVED: {solvedCount} / {total}
        </div>
        <div className="modal-btns">
          {!allDone && (
            <button className="modal-next" onClick={onNext}>
              {nextLabel}
            </button>
          )}
          <button className="modal-close" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </Overlay>
  );
}
