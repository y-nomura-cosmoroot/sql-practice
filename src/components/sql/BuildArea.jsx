import { Fragment } from 'react';

/**
 * 配置済みトークン（チップ）の表示領域。
 * - チップをタップするとそのトークンを削除する。
 * - 現在の挿入位置に点滅カーソル（|）を表示する。新しい部品はこの位置に入る。
 */
export default function BuildArea({ tokens, cursor, onRemove }) {
  if (tokens.length === 0) {
    return (
      <div className="build-area">
        <span className="caret" aria-hidden="true" />
        <span className="placeholder-hint">
          下のパレットから部品をタップして組み立て。置いた部品をタップすると削除できます。
        </span>
      </div>
    );
  }

  return (
    <div className="build-area">
      {tokens.map((t, i) => (
        <Fragment key={i}>
          {cursor === i && <span className="caret" aria-hidden="true" />}
          <span className="chip placed" onClick={() => onRemove(i)}>
            {t}
          </span>
        </Fragment>
      ))}
      {cursor === tokens.length && <span className="caret" aria-hidden="true" />}
    </div>
  );
}
