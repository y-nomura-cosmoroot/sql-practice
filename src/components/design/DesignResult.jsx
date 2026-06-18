/**
 * 「判定結果」タブ。各チェック項目を ✓ / ✗ で一覧表示する。
 * @param {{ checks: Array<[boolean, string]> | null }} props
 */
export default function DesignResult({ checks }) {
  if (!checks) return null;
  const passed = checks.filter((c) => c[0]).length;
  return (
    <div>
      <div className="res-label">
        判定結果（{passed} / {checks.length} 項目クリア）
      </div>
      {checks.map((c, i) => (
        <div className={`d-check ${c[0] ? 'ok' : 'ng'}`} key={i}>
          <span className="ic">{c[0] ? '✓' : '✗'}</span>
          <span>{c[1]}</span>
        </div>
      ))}
    </div>
  );
}
