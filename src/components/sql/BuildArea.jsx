import { buildSql } from '../../lib/buildSql.js';

/**
 * 配置済みトークン（チップ）の表示領域と、組み立て中SQLのプレビュー。
 * チップをクリックするとそのトークンを削除する。
 */
export default function BuildArea({ tokens, onRemove }) {
  return (
    <>
      <div className="build-area">
        {tokens.length === 0 ? (
          <span className="placeholder-hint">
            下のパレットから部品をタップして組み立て。置いた部品をタップすると削除できます。
          </span>
        ) : (
          tokens.map((t, i) => (
            <span key={i} className="chip placed" onClick={() => onRemove(i)}>
              {t}
            </span>
          ))
        )}
      </div>
      <div className="built-sql">
        {tokens.length ? (
          buildSql(tokens)
        ) : (
          <span className="lbl">組み立てたSQLがここに表示されます</span>
        )}
      </div>
    </>
  );
}
