import { useMemo } from 'react';
import schema from '../../data/schema.json';
import DataTable from '../common/DataTable.jsx';

/**
 * テーブル構成（スキーマ）。テーブル名・列名は部品パレットと同じトークンとして
 * タップでき、SQL 組み立てエリアの挿入位置に入る。下部にサンプルデータ（折りたたみ）。
 */
export default function SchemaView({ db, onPick }) {
  // サンプルデータは DB が用意できた時点で一度だけ取得する。
  const samples = useMemo(
    () =>
      schema.map((t) => {
        const r = db.exec(`SELECT * FROM ${t.name}`);
        return { name: t.name, result: r.length ? r[0] : null };
      }),
    [db]
  );

  return (
    <div>
      <div className="schema-hint">
        テーブル名・列名をタップすると組み立てエリアに挿入できます。
      </div>

      {schema.map((t) => (
        <div className="schema-table" key={t.name}>
          <div className="schema-name-row">
            <button type="button" className="tok tb" onClick={() => onPick(t.name)}>
              {t.name}
            </button>
            <span className="schema-desc">{t.desc}</span>
          </div>
          <div className="schema-cols">
            {t.cols.map((c, i) => (
              <div className="schema-col-row" key={i}>
                <button type="button" className="tok col" onClick={() => onPick(c.c)}>
                  {c.c}
                </button>
                <span className="muted">{c.t}</span>
                {c.note ? <span className="muted">{c.note}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      <details>
        <summary>サンプルデータを見る</summary>
        <div>
          {samples.map((s) =>
            s.result ? (
              <div key={s.name}>
                <div className="res-label">{s.name}</div>
                <DataTable columns={s.result.columns} values={s.result.values} />
              </div>
            ) : null
          )}
        </div>
      </details>
    </div>
  );
}
