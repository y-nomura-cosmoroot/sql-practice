import Overlay from '../common/Overlay.jsx';
import ResultView from './ResultView.jsx';

// 答え合わせ時の見出し文言（モードは SQL 固定）。
const CHECK = {
  correct: { emoji: '🎉', title: '正解！', body: '結果が一致しました。よくできました！' },
  allDone: { emoji: '🏆', title: '全問クリア！', body: 'すべてクリアしました。お見事です！' },
  wrong: {
    emoji: '❌',
    title: '不正解',
    body: '期待される結果と一致しませんでした。ヒントや解答例も活用しましょう。',
  },
};

/**
 * 実行結果・答え合わせの結果をテーブル付きで表示するポップアップ。
 * - kind 'run'  : 実行結果のみ
 * - kind 'check': 正誤の見出し＋結果＋進捗＋「次へ／もう一度挑戦」
 */
export default function ResultPopup({
  open,
  kind,
  result,
  correct,
  allDone,
  solvedCount,
  total,
  onNext,
  onClose,
}) {
  const isCheck = kind === 'check';
  const head = isCheck ? (!correct ? CHECK.wrong : allDone ? CHECK.allDone : CHECK.correct) : null;
  const variant = !isCheck ? ' result-run' : !correct ? ' ng' : '';

  return (
    <Overlay open={open} onClose={onClose}>
      <div className={`modal result-popup${variant}`}>
        {isCheck ? (
          <>
            <div className="emoji">{head.emoji}</div>
            <h3>{head.title}</h3>
            <p>{head.body}</p>
          </>
        ) : (
          <h3>実行結果</h3>
        )}

        <div className="result-popup-body">
          <ResultView result={result} />
        </div>

        {isCheck && (
          <div className="modal-progress">
            正解: {solvedCount} / {total}
          </div>
        )}

        <div className="modal-btns">
          {isCheck && !allDone && (
            <button className="modal-next" onClick={onNext}>
              {correct ? '次へ →' : 'もう一度挑戦'}
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
