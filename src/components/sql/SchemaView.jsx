import { useMemo } from 'react';
import schema from '../../data/schema.json';
import DataTable from '../common/DataTable.jsx';

/**
 * テーブル構成（スキーマ）と、折りたたみのサンプルデータを表示する。
 */
export default function SchemaView({ db }) {
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
      {schema.map((t) => (
        <div className="schema-table" key={t.name}>
          <div className="schema-name">
            {t.name} <span className="schema-desc">({t.desc})</span>
          </div>
          <div className="schema-cols">
            {t.cols.map((c, i) => (
              <div className={`col ${c.tag || ''}`} key={i}>
                {c.c} <span className="muted">{c.t}</span>
                {c.note ? <span className="muted"> — {c.note}</span> : null}
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
