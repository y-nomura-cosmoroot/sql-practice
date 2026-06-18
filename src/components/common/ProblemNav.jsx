/**
 * 問題番号ボタンの並び（SQL・設計モード共通）。
 */
export default function ProblemNav({ count, current, solved, onSelect }) {
  return (
    <div className="prob-nav">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          className={`prob-btn${i === current ? ' active' : ''}${solved[i] ? ' solved' : ''}`}
          onClick={() => onSelect(i)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
